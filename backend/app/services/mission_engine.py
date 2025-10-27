# backend/app/services/mission_engine.py
from __future__ import annotations
import json, hashlib, time
from typing import Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.engine import Connection

def _sha(payload: Any) -> str:
    # hash determinístico das evidências
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

class MissionEngine:
    """
    Engine simples para validar missões a partir de eventos.
    Lê regras em mission_rules.rules_json (JSON) usando SQL direto (sem ORM).

    Regras suportadas (MVP):
      - event_count: { event_type, min }
      - qr_scanned:  { required: true }
      - geo_check:   { radius_m, lat, lng }  (stub: espera payload.geo_ok=true)
      - custom_key:  { key: "passed", equals: true }  (quiz aprovado etc.)
    """

    def __init__(self, db: Connection, user_id: int):
        self.db = db
        self.user_id = user_id

    def _get_rule(self, mission_slug: str) -> Optional[Dict[str, Any]]:
        row = self.db.execute(
            text("SELECT rule_config FROM mission_rules WHERE mission_slug=:slug"),
            {"slug": mission_slug},
        ).fetchone()
        if not row:
            return None
        try:
            return json.loads(row[0])
        except Exception:
            return None

    def evaluate(self, mission_slug: str, triggering_event: Dict[str, Any]) -> Dict[str, Any]:
        rule = self._get_rule(mission_slug)
        if not rule:
            return {"status":"pending","score":0,"evidence_hash":None,"reason":"no_rule"}

        status = "pending"
        score  = 0
        reason = "no_match"

        # 1) event_count
        if "event_count" in rule:
            ec = rule["event_count"]
            evt = ec.get("event_type")
            minc = int(ec.get("min", 1))
            cnt = self.db.execute(text("""
                SELECT COUNT(*) FROM mission_events
                WHERE user_id=:uid AND mission_slug=:slug AND event_type=:evt
            """), {"uid": self.user_id, "slug": mission_slug, "evt": evt}).scalar() or 0
            if cnt >= minc:
                status, score, reason = "approved", 100, "event_count_ok"

        # 2) qr_scanned
        if status != "approved" and rule.get("qr_scanned", {}).get("required"):
            if triggering_event.get("event_type") == "qr_scanned":
                status, score, reason = "approved", 100, "qr_ok"

        # 3) geo_check (stub)
        if status != "approved" and "geo_check" in rule:
            if triggering_event.get("payload", {}).get("geo_ok") is True:
                status, score, reason = "approved", 100, "geo_ok"

        # 4) custom_key equality
        if status != "approved" and "custom_key" in rule:
            ck = rule["custom_key"]
            key = ck.get("key"); expected = ck.get("equals")
            if triggering_event.get("payload", {}).get(key) == expected:
                status, score, reason = "approved", 100, "custom_ok"

        evidence_hash = _sha({"mission": mission_slug, "reason": reason, "t": int(time.time())})
        return {"status": status, "score": score, "evidence_hash": evidence_hash, "reason": reason}