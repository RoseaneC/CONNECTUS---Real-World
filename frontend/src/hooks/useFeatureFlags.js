import { useEffect, useState } from "react";
import api from "../services/api";
import { loadFeatureFlags } from "../services/flags";

export default function useFeatureFlags() {
  const [flags, setFlags] = useState({ rpm: false, rpmSubdomain: "demo" });
  useEffect(() => {
    let alive = true;
    loadFeatureFlags(api).then(v => { if (alive) setFlags(v); });
    return () => { alive = false; };
  }, []);
  return flags; // { rpm, rpmSubdomain }
}

