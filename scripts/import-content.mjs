#!/usr/bin/env node
// Intègre un export admin (k2th-content) dans le bundle hors-ligne :
//   node scripts/import-content.mjs <chemin-export.json>
// Met à jour src/data/content.json (version + 1), décode les médias vers
// assets/media/ et régénère src/data/bundledMedia.ts (registre require()).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const contentPath = path.join(root, 'src/data/content.json');
const mediaDir = path.join(root, 'assets/media');
const registryPath = path.join(root, 'src/data/bundledMedia.ts');

const KINDS = ['codes', 'kojas', 'techniques', 'chants'];
const SAFE_KEY = /^[A-Za-z0-9._-]+$/;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const exportArg = process.argv[2];
if (!exportArg) {
  fail('Usage : node scripts/import-content.mjs <chemin-export.json>');
}

const exportPath = path.resolve(root, exportArg);
let payload;
try {
  payload = JSON.parse(await readFile(exportPath, 'utf8'));
} catch (error) {
  fail(`Lecture de l'export impossible (${exportPath}) : ${error.message}`);
}

if (payload?.format !== 'k2th-content' || payload?.formatVersion !== 1) {
  fail("Format d'export non reconnu (attendu : k2th-content v1).");
}

const content = payload.content;
if (!content || typeof content !== 'object') {
  fail('Export sans contenu.');
}
for (const kind of KINDS) {
  if (!Array.isArray(content[kind])) {
    fail(`Contenu invalide : « ${kind} » doit être un tableau.`);
  }
}

const media = payload.media && typeof payload.media === 'object' ? payload.media : {};
const keys = Object.keys(media);
for (const key of keys) {
  if (!SAFE_KEY.test(key) || key.includes('..')) {
    fail(`Clé média invalide (nom de fichier attendu) : « ${key} ».`);
  }
}

let currentVersion = 0;
try {
  const existing = JSON.parse(await readFile(contentPath, 'utf8'));
  currentVersion = Number.isInteger(existing.version) ? existing.version : 0;
} catch {
  // Pas de content.json existant : on repart de 0.
}
const version = currentVersion + 1;

const nextContent = {
  version,
  codes: content.codes,
  kojas: content.kojas,
  techniques: content.techniques,
  chants: content.chants,
};
await writeFile(contentPath, `${JSON.stringify(nextContent, null, 2)}\n`, 'utf8');

// Dossier généré : on le reconstruit pour ne garder que les médias de cet export.
await rm(mediaDir, { recursive: true, force: true });
await mkdir(mediaDir, { recursive: true });

const registryEntries = [];
for (const key of keys) {
  const entry = media[key];
  const base64 = typeof entry === 'string' ? entry : entry?.base64;
  if (typeof base64 !== 'string' || !base64) {
    console.warn(`⚠ Média « ${key} » sans base64 — ignoré.`);
    continue;
  }
  await writeFile(path.join(mediaDir, key), Buffer.from(base64, 'base64'));
  registryEntries.push(`  ${JSON.stringify(key)}: require('../../assets/media/${key}'),`);
}

const registry =
  '// Généré par scripts/import-content.mjs — ne pas modifier à la main.\n' +
  'export const BUNDLED_MEDIA: Record<string, number> = {\n' +
  (registryEntries.length ? `${registryEntries.join('\n')}\n` : '') +
  '};\n';
await writeFile(registryPath, registry, 'utf8');

console.log(`✔ Contenu importé : version ${version}`);
console.log(
  `  codes=${content.codes.length} kojas=${content.kojas.length} ` +
    `techniques=${content.techniques.length} chants=${content.chants.length}`,
);
console.log(`  médias embarqués=${registryEntries.length}`);
console.log('  → Relance l’app (ou republie) pour que les utilisateurs reçoivent ce contenu.');