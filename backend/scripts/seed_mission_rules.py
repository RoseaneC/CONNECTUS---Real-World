#!/usr/bin/env python3
"""
Seed Simples de Regras de Missão - Sistema de Missões em Tempo Real
Popula o banco com regras declarativas de exemplo (sem dependências de relacionamentos)
"""

import sqlite3
import json
from pathlib import Path

DB = "connectus.db"
if not Path(DB).exists():
    for p in ["./backend/app/connectus.db","./backend/connectus.db","./connectus.db"]:
        if Path(p).exists():
            DB = p; break

con = sqlite3.connect(DB)
cur = con.cursor()

def upsert_flag(key, enabled):
    cur.execute("INSERT OR IGNORE INTO feature_flags(flag_name,flag_value) VALUES(?,?)",(key,int(enabled)))
    cur.execute("UPDATE feature_flags SET flag_value=? WHERE flag_name=?",(int(enabled),key))

def upsert_rule(slug, rules):
    cur.execute("INSERT OR IGNORE INTO mission_rules(mission_slug, rule_config) VALUES (?,?)",
                (slug, json.dumps(rules)))
    cur.execute("UPDATE mission_rules SET rule_config=? WHERE mission_slug=?",
                (json.dumps(rules), slug))

# flags
upsert_flag("MISSIONS_REALTIME_ENABLED", 1)

# regras
upsert_rule("onboarding_qr",    {"qr_scanned":{"required":True}})
upsert_rule("timeline_3_posts", {"event_count":{"event_type":"post_created","min":3}})
upsert_rule("quiz_basico_ok",   {"custom_key":{"key":"passed","equals":True}})
upsert_rule("presenca_evento",  {"geo_check":{"radius_m":100}})

con.commit()
con.close()
print("Mission rules seed OK.")