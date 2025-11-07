import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(frontendDir, '..');

function listEnvFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.startsWith('.env'))
    .map((name) => path.join(dir, name));
}

function logEnvFiles(envFiles, scope) {
  if (!envFiles.length) {
    console.info(`[CONFIG] ℹ️ Nenhum arquivo .env encontrado em ${scope}`);
    return;
  }

  console.info(`[CONFIG] ℹ️ ${scope} env files:`);
  envFiles.forEach((file) => {
    const stats = fs.statSync(file);
    console.info(`  - ${file} (${stats.size} bytes)`);
  });
}

function dedupeEnvContent(lines) {
  const result = [];
  const keyIndex = new Map();

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);

    if (!match || trimmed.startsWith('#')) {
      result.push(line);
      return;
    }

    const key = match[1];
    if (keyIndex.has(key)) {
      const prev = keyIndex.get(key);
      result[prev] = null;
    }

    keyIndex.set(key, result.length);
    result.push(`${key}=${match[2]}`);
  });

  return result.filter((line) => line !== null);
}

function ensureEnvVars(filePath, required, defaults) {
  let contents = '';
  if (fs.existsSync(filePath)) {
    contents = fs.readFileSync(filePath, 'utf8');
  }

  const originalLines = contents.split(/\r?\n/);
  const deduped = dedupeEnvContent(originalLines);

  const existing = new Map();
  deduped.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (match) {
      existing.set(match[1], match[2]);
    }
  });

  required.forEach((key) => {
    if (!existing.has(key)) {
      const value = defaults[key] ?? '';
      deduped.push(`${key}=${value}`);
      existing.set(key, value);
      console.warn(`[CONFIG] ⚠️ Missing ${key} — applying default: ${value}`);
    }
  });

  const finalLines = deduped.filter((line, index, arr) => {
    // remove leading/trailing blank duplicates by collapsing multiple blank lines
    if (!line.trim()) {
      const prev = arr[index - 1];
      return prev && prev.trim();
    }
    return true;
  });

  fs.writeFileSync(filePath, `${finalLines.join('\n').trim()}\n`, 'utf8');
  return existing;
}

function main() {
  const rootEnvFiles = listEnvFiles(projectRoot);
  const frontendEnvFiles = listEnvFiles(frontendDir);

  logEnvFiles(rootEnvFiles, 'Root');
  logEnvFiles(frontendEnvFiles, 'Frontend');

  const allEnvLocal = [...rootEnvFiles, ...frontendEnvFiles].filter(
    (file) => path.basename(file) === '.env.local',
  );

  if (allEnvLocal.length > 1) {
    console.warn('[CONFIG] ⚠️ Detected multiple .env.local files:', allEnvLocal);
  }

  const requiredKeys = [
    'VITE_API_URL',
    'VITE_WITH_CREDENTIALS',
    'VITE_FEATURE_RPM',
    'VITE_RPM_SUBDOMAIN',
    'VITE_WEB3_DEMO_MODE',
    'VITE_ENABLE_STAKING_UI',
    'VITE_SEPOLIA_CHAIN_ID',
    'VITE_SEPOLIA_TOKEN_ADDRESS',
    'VITE_SEPOLIA_TOKENSHOP_ADDRESS',
    'VITE_WEB3_ENABLED',
  ];

  const defaults = {
    VITE_SEPOLIA_CHAIN_ID: '11155111',
    VITE_SEPOLIA_TOKEN_ADDRESS: '0x96DcF6a7E553DE98fA84Df2CABb94A2CAD2b2367',
    VITE_SEPOLIA_TOKENSHOP_ADDRESS: '0xF0D54342F02d3A3C7409DE472C4bE7E0D971A6B0',
    VITE_WEB3_ENABLED: 'true',
  };

  const envLocalPath = path.join(frontendDir, '.env.local');
  const values = ensureEnvVars(envLocalPath, requiredKeys, defaults);

  console.info('[CONFIG] ✅ Final frontend/.env.local values:');
  requiredKeys.forEach((key) => {
    console.info(`  - ${key}=${values.get(key) ?? ''}`);
  });
}

main();

