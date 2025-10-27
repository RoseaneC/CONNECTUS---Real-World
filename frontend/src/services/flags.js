// Fallback local de flags com ENV
export function getLocalFlags() {
  const rpmEnv = (import.meta.env?.VITE_FEATURE_RPM ?? "false")
    .toString()
    .trim()
    .toLowerCase();
  return {
    rpm: ["true", "1", "yes", "y"].includes(rpmEnv),
    rpmSubdomain: import.meta.env?.VITE_RPM_SUBDOMAIN || "demo",
  };
}

// Tenta buscar do backend e cai no ENV se vier undefined/erro
export async function loadFeatureFlags(api) {
  const local = getLocalFlags();
  try {
    const res = await api.get("/public/feature-flags");
    const s = res?.data || {};
    return {
      rpm: typeof s.rpm === "boolean" ? s.rpm : local.rpm,
      rpmSubdomain: s.rpmSubdomain || local.rpmSubdomain,
    };
  } catch {
    return local;
  }
}

