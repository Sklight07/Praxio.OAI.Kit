#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const rl   = require('readline');

const PKG_ROOT = path.resolve(__dirname, '..');
const CWD      = process.cwd();
const args     = process.argv.slice(2);
const cmd      = args[0];

const CLAUDE_MD_IMPORT = '@.claude/oai-kit.md';
const GITIGNORE_ENTRIES = ['.mcp.json', '.claude/.local-config.json'];

// user-owned = preserved if exists (project data); kit-managed = always overwritten
const BASE_ITEMS = [
  { src: '.oai-kit',  kitManaged: true  },
  { src: 'scripts',   kitManaged: true  },
  { src: 'docs',      kitManaged: true  },
  { src: '.speckit',  kitManaged: false },
  { src: '.oai-flow', kitManaged: false },
];

// ─── helpers ───────────────────────────────────────────────────────────────

function ask(question) {
  const iface = rl.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => iface.question(question, ans => { iface.close(); resolve(ans.trim()); }));
}

function copyDir(src, dest, overwrite) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: overwrite });
}

function ensureGitignore(entries) {
  const p = path.join(CWD, '.gitignore');
  let content = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  let added = false;
  for (const e of entries) {
    if (!content.includes(e)) { content += `\n${e}`; added = true; }
  }
  if (added) fs.writeFileSync(p, content.trimStart());
}

function removeFromGitignore(entry) {
  const p = path.join(CWD, '.gitignore');
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  const filtered = lines.filter(l => l.trim() !== entry.trim());
  if (filtered.length !== lines.length) {
    fs.writeFileSync(p, filtered.join('\n'));
  }
}

function injectClaudeMd() {
  const p = path.join(CWD, 'CLAUDE.md');
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `${CLAUDE_MD_IMPORT}\n`);
    console.log('  ✓ CLAUDE.md criado com import do oai-kit');
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  if (!content.includes(CLAUDE_MD_IMPORT)) {
    fs.appendFileSync(p, `\n${CLAUDE_MD_IMPORT}\n`);
    console.log('  ✓ Import do oai-kit adicionado ao CLAUDE.md existente');
  } else {
    console.log('  ✓ CLAUDE.md já contém o import do oai-kit');
  }
}

function readOaiKitYaml() {
  const p = path.join(CWD, 'oai-kit.yaml');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function parseYamlList(yaml, key) {
  const re = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-[ \\t]+\\S+[ \\t]*\\n?)+)`, 'm');
  const m = yaml.match(re);
  if (!m) return [];
  return m[1].trim().split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
}

function writeOaiKitYaml(projectName, ides, profiles) {
  const templatePath = path.join(PKG_ROOT, '.oai-kit', 'config', 'oai-kit.yaml.template');
  let content;
  if (fs.existsSync(templatePath)) {
    content = fs.readFileSync(templatePath, 'utf8')
      .replace('{{PROJECT_NAME}}', projectName);
    content = content.replace(/^ides:\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m,
      `ides:\n${ides.map(i => `  - ${i}`).join('\n')}\n`);
    content = content.replace(/^profiles:\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m,
      `profiles:\n${profiles.map(p => `  - ${p}`).join('\n')}\n`);
  } else {
    content = `project: "${projectName}"\nversion: "2.0.0"\n\nides:\n${ides.map(i => `  - ${i}`).join('\n')}\n\nprofiles:\n${profiles.map(p => `  - ${p}`).join('\n')}\n`;
  }
  fs.writeFileSync(path.join(CWD, 'oai-kit.yaml'), content);
  console.log('  ✓ oai-kit.yaml gerado');
}

function runClaudeAdapter(profiles) {
  try {
    const adapter = require('../scripts/adapter-claude');
    adapter.runAdapter(CWD, profiles);
    console.log(`  ✓ Adapter Claude executado — perfis: ${profiles.join(', ')}`);
  } catch (e) {
    console.error('  ⚠  Erro ao executar adapter Claude:', e.message);
  }
}

function runCursorAdapter(profiles) {
  try {
    const adapter = require('../scripts/adapter-cursor');
    adapter.runAdapter(CWD, profiles);
    console.log(`  ✓ Adapter Cursor executado — .cursor/rules/ gerado`);
  } catch (e) {
    console.error('  ⚠  Erro ao executar adapter Cursor:', e.message);
  }
}

function makeExecutable() {
  if (process.platform !== 'win32') {
    try {
      const { execSync } = require('child_process');
      execSync('chmod +x scripts/*.sh', { cwd: CWD, stdio: 'ignore' });
      console.log('  ✓ scripts/*.sh marcados como executáveis');
    } catch (_) {}
  } else {
    console.log('  ℹ  Windows detectado — execute os scripts via Git Bash ou WSL');
  }
}

// ─── cmdInit ───────────────────────────────────────────────────────────────

async function cmdInit() {
  const force = args.includes('--force');
  console.log('\n🚀 Inicializando praxio-oai-kit v2.0...\n');

  // Copy base items
  for (const item of BASE_ITEMS) {
    const src  = path.join(PKG_ROOT, item.src);
    const dest = path.join(CWD, item.src);
    const overwrite = item.kitManaged || force;

    if (!item.kitManaged && fs.existsSync(dest) && !force) {
      console.log(`  ⏭  ${item.src} preservado (dados do projeto — use --force para sobrescrever)`);
      continue;
    }
    copyDir(src, dest, overwrite);
    console.log(`  ✓ ${item.src} ${overwrite && fs.existsSync(dest) ? 'atualizado' : 'instalado'}`);
  }

  // Pergunta nome do projeto
  const projectName = await ask('\nNome do projeto (ex: Praxio.Api.Faturamento): ');

  // Pergunta IDEs
  console.log('\nQuais IDEs serão usadas neste repositório?');
  console.log('  1 - Claude Code (padrão)');
  console.log('  2 - Cursor');
  const idesInput = (await ask('  Selecione (ex: 1 ou 1,2) [padrão: 1]: ')) || '1';
  const ides = [];
  if (idesInput.includes('1')) ides.push('claude');
  if (idesInput.includes('2')) ides.push('cursor');
  if (ides.length === 0) ides.push('claude');

  // Pergunta perfis
  console.log('\nQuais perfis serão usados neste repositório?');
  console.log('  1 - Developer (padrão)');
  console.log('  2 - QA');
  console.log('  3 - PO (Product Owner)');
  const profilesInput = (await ask('  Selecione (ex: 1 ou 1,2) [padrão: 1]: ')) || '1';
  const profiles = [];
  if (profilesInput.includes('1')) profiles.push('developer');
  if (profilesInput.includes('2')) profiles.push('qa');
  if (profilesInput.includes('3')) profiles.push('po');
  if (profiles.length === 0) profiles.push('developer');

  // Gera oai-kit.yaml
  writeOaiKitYaml(projectName || 'my-project', ides, profiles);

  // Executa adapters
  if (ides.includes('claude')) {
    runClaudeAdapter(profiles);
    injectClaudeMd();
  }
  if (ides.includes('cursor')) {
    runCursorAdapter(profiles);
  }

  const gitignoreEntries = [...GITIGNORE_ENTRIES];
  if (!ides.includes('cursor')) gitignoreEntries.push('.cursor/rules/');
  ensureGitignore(gitignoreEntries);
  if (ides.includes('cursor')) removeFromGitignore('.cursor/rules/');
  console.log('  ✓ .gitignore atualizado');
  makeExecutable();

  console.log('\n✅ Kit instalado com sucesso!\n');
  console.log('Próximos passos:');
  console.log('  1. npx praxio-oai-kit setup-mcp              (configura Azure DevOps MCP)');
  console.log('  2. /oai-kit-bootstrap-repo NOME_DO_SISTEMA   (onboarding do repositório)');
  console.log('  3. /oai-kit-refine-card {ID_AZURE_TASK}      (refinar primeiro card)\n');
}

// ─── cmdMigrate ────────────────────────────────────────────────────────────

async function cmdMigrate() {
  console.log('\n🔄 Migrando repositório de OAI Kit v1.x → v2.0...\n');

  const hasV1 = fs.existsSync(path.join(CWD, '.claude', 'agents'));
  const hasV2 = fs.existsSync(path.join(CWD, '.oai-kit'));

  if (hasV2) {
    console.log('  ℹ  .oai-kit/ já existe — este repositório parece estar em v2.0.');
    const force = (await ask('  Forçar reinstalação? (s/N): ')).toLowerCase();
    if (force !== 's' && force !== 'sim') { console.log('  Cancelado.\n'); return; }
  }

  if (!hasV1) {
    console.log('  ⚠  Nenhum .claude/agents/ encontrado. Este repositório não parece ter OAI Kit v1.x.');
    const proceed = (await ask('  Continuar mesmo assim? (s/N): ')).toLowerCase();
    if (proceed !== 's' && proceed !== 'sim') { console.log('  Cancelado.\n'); return; }
  }

  console.log('  Copiando estrutura .oai-kit/ do pacote...');
  copyDir(path.join(PKG_ROOT, '.oai-kit'), path.join(CWD, '.oai-kit'), true);
  copyDir(path.join(PKG_ROOT, 'scripts'), path.join(CWD, 'scripts'), true);
  copyDir(path.join(PKG_ROOT, 'docs'), path.join(CWD, 'docs'), true);
  console.log('  ✓ .oai-kit/ instalado');

  const projectName = await ask('\nNome do projeto: ');

  console.log('\nQuais IDEs serão usadas neste repositório?');
  console.log('  1 - Claude Code (padrão)');
  console.log('  2 - Cursor');
  const idesInput = (await ask('  Selecione [padrão: 1]: ')) || '1';
  const ides = [];
  if (idesInput.includes('1')) ides.push('claude');
  if (idesInput.includes('2')) ides.push('cursor');
  if (ides.length === 0) ides.push('claude');

  console.log('\nQuais perfis serão usados?');
  console.log('  1 - Developer (padrão)');
  console.log('  2 - QA');
  console.log('  3 - PO (Product Owner)');
  const profilesInput = (await ask('  Selecione [padrão: 1]: ')) || '1';
  const profiles = [];
  if (profilesInput.includes('1')) profiles.push('developer');
  if (profilesInput.includes('2')) profiles.push('qa');
  if (profilesInput.includes('3')) profiles.push('po');
  if (profiles.length === 0) profiles.push('developer');

  writeOaiKitYaml(projectName || 'my-project', ides, profiles);

  if (ides.includes('claude')) {
    runClaudeAdapter(profiles);
    injectClaudeMd();
  }

  ensureGitignore(GITIGNORE_ENTRIES);
  makeExecutable();

  console.log('\n✅ Migração concluída!\n');
  console.log('O que foi feito:');
  console.log('  - .oai-kit/ criado (nova fonte de verdade)');
  console.log('  - .claude/agents/ e .claude/commands/ regenerados pelo adapter');
  console.log('  - oai-kit.yaml criado\n');
  console.log('Próximo passo: commit dos novos arquivos no repositório');
  console.log('  git add .oai-kit oai-kit.yaml .claude/agents .claude/commands .claude/oai-kit.md');
  console.log('  git commit -m "chore: migrar para OAI Kit v2.0"\n');
}

// ─── cmdUpdate ─────────────────────────────────────────────────────────────

async function cmdUpdate() {
  console.log('\n🔃 Atualizando praxio-oai-kit...\n');

  const yaml = readOaiKitYaml();
  if (!yaml) {
    console.error('  ✗ oai-kit.yaml não encontrado. Execute init ou migrate primeiro.\n');
    return;
  }

  const ides     = parseYamlList(yaml, 'ides');
  const profiles = parseYamlList(yaml, 'profiles');

  console.log(`  IDEs instaladas: ${ides.join(', ')}`);
  console.log(`  Perfis instalados: ${profiles.join(', ')}\n`);

  // Atualiza .oai-kit/ do pacote
  copyDir(path.join(PKG_ROOT, '.oai-kit'), path.join(CWD, '.oai-kit'), true);
  copyDir(path.join(PKG_ROOT, 'scripts'), path.join(CWD, 'scripts'), true);
  copyDir(path.join(PKG_ROOT, 'docs'), path.join(CWD, 'docs'), true);
  console.log('  ✓ .oai-kit/ atualizado');

  // Re-executa adapters
  if (ides.includes('claude')) {
    runClaudeAdapter(profiles);
  }
  if (ides.includes('cursor')) {
    runCursorAdapter(profiles);
  }

  // Atualiza versão no yaml
  let updatedYaml = yaml.replace(/version:\s*"[^"]*"/, `version: "2.0.0"`);
  fs.writeFileSync(path.join(CWD, 'oai-kit.yaml'), updatedYaml);
  console.log('  ✓ oai-kit.yaml atualizado\n');

  console.log('✅ Atualização concluída!\n');
}

// ─── cmdIde ────────────────────────────────────────────────────────────────

async function cmdIde() {
  const subCmd = args[1];
  const ideName = args[2];

  if (subCmd !== 'add' || !ideName) {
    console.log('\nUso: npx praxio-oai-kit ide add <claude|cursor>\n');
    return;
  }

  console.log(`\n➕ Adicionando IDE: ${ideName}...\n`);

  const yaml = readOaiKitYaml();
  if (!yaml) {
    console.error('  ✗ oai-kit.yaml não encontrado. Execute init primeiro.\n');
    return;
  }

  const ides     = parseYamlList(yaml, 'ides');
  const profiles = parseYamlList(yaml, 'profiles');

  if (ides.includes(ideName)) {
    console.log(`  ℹ  IDE '${ideName}' já está instalada.`);
  } else {
    ides.push(ideName);
  }

  if (ideName === 'claude') {
    runClaudeAdapter(profiles);
    injectClaudeMd();
  } else if (ideName === 'cursor') {
    runCursorAdapter(profiles);
    removeFromGitignore('.cursor/rules/');
    console.log('  ✓ .cursor/rules/ removido do .gitignore (commitar junto com o projeto)');
  } else {
    console.log(`  ⚠  IDE '${ideName}' não reconhecida.`);
    return;
  }

  // Atualiza yaml
  const updatedYaml = yaml.replace(
    /^ides:\s*\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m,
    `ides:\n${ides.map(i => `  - ${i}`).join('\n')}\n`
  );
  fs.writeFileSync(path.join(CWD, 'oai-kit.yaml'), updatedYaml);
  console.log(`  ✓ oai-kit.yaml atualizado\n`);
  console.log(`✅ IDE '${ideName}' adicionada!\n`);
}

// ─── cmdProfile ────────────────────────────────────────────────────────────

async function cmdProfile() {
  const subCmd     = args[1];
  const profileName = args[2];

  if (subCmd !== 'add' || !profileName) {
    console.log('\nUso: npx praxio-oai-kit profile add <developer|qa|po>\n');
    return;
  }

  const validProfiles = ['developer', 'qa', 'po'];
  if (!validProfiles.includes(profileName)) {
    console.log(`\n  ⚠  Perfil '${profileName}' não reconhecido. Opções: ${validProfiles.join(', ')}\n`);
    return;
  }

  console.log(`\n➕ Adicionando perfil: ${profileName}...\n`);

  const yaml = readOaiKitYaml();
  if (!yaml) {
    console.error('  ✗ oai-kit.yaml não encontrado. Execute init primeiro.\n');
    return;
  }

  const ides     = parseYamlList(yaml, 'ides');
  const profiles = parseYamlList(yaml, 'profiles');

  if (profiles.includes(profileName)) {
    console.log(`  ℹ  Perfil '${profileName}' já está instalado.`);
  } else {
    profiles.push(profileName);
  }

  // Copia agentes e comandos do perfil para .oai-kit/ no CWD (se não existirem)
  const profileAgentsSrc  = path.join(PKG_ROOT, '.oai-kit', 'agents', profileName);
  const profileAgentsDest = path.join(CWD, '.oai-kit', 'agents', profileName);
  const profileCmdSrc     = path.join(PKG_ROOT, '.oai-kit', 'commands', profileName);
  const profileCmdDest    = path.join(CWD, '.oai-kit', 'commands', profileName);

  if (fs.existsSync(profileAgentsSrc)) {
    copyDir(profileAgentsSrc, profileAgentsDest, true);
    console.log(`  ✓ Agentes do perfil '${profileName}' instalados`);
  } else {
    console.log(`  ℹ  Nenhum agente encontrado para perfil '${profileName}' (será criado em versão futura)`);
  }
  if (fs.existsSync(profileCmdSrc)) {
    copyDir(profileCmdSrc, profileCmdDest, true);
    console.log(`  ✓ Comandos do perfil '${profileName}' instalados`);
  }

  // Re-executa adapters para incluir novo perfil
  if (ides.includes('claude')) {
    runClaudeAdapter(profiles);
  }
  if (ides.includes('cursor')) {
    runCursorAdapter(profiles);
  }

  // Atualiza yaml
  const updatedYaml = yaml.replace(
    /^profiles:\s*\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m,
    `profiles:\n${profiles.map(p => `  - ${p}`).join('\n')}\n`
  );
  fs.writeFileSync(path.join(CWD, 'oai-kit.yaml'), updatedYaml);
  console.log(`  ✓ oai-kit.yaml atualizado\n`);
  console.log(`✅ Perfil '${profileName}' adicionado!\n`);
}

// ─── cmdSetupMcp ───────────────────────────────────────────────────────────

async function cmdSetupMcp() {
  console.log('\n⚙️  Configuração do Azure DevOps MCP\n');

  const configPath = path.join(CWD, '.claude', '.local-config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (_) {}
  }

  const org      = await ask('Azure DevOps Organization — nome da org (ex: praxio): ');
  const authMode = ((await ask('Autenticação — (1) PAT  (2) az cli [padrão: 1]: ')) || '1') === '1' ? 'pat' : 'azcli';

  let patB64 = '';
  if (authMode === 'pat') {
    const email = await ask('E-mail da conta Azure DevOps: ');
    const pat   = await ask('Personal Access Token: ');
    patB64 = Buffer.from(`${email}:${pat}`).toString('base64');
  }

  const briefingDir = path.join(CWD, '.oai-flow', 'analysis');

  const knownRepos = [];
  const addRepos = (await ask('\nDeseja cadastrar repositórios relacionados? (s/N): ')).toLowerCase();
  if (addRepos === 's' || addRepos === 'sim') {
    console.log('  (Enter em branco para finalizar)\n');
    let i = 1;
    while (true) {
      const name = await ask(`  Repo ${i} — Nome (ex: Frontend): `);
      if (!name) break;
      const repoPath = await ask(`  Repo ${i} — Caminho local: `);
      const type = (await ask(`  Repo ${i} — Tipo (frontend/backend/library/integration) [library]: `)) || 'library';
      const description = await ask(`  Repo ${i} — Descrição breve: `);
      knownRepos.push({ name, path: repoPath, type, description });
      i++;
    }
  }

  config = {
    schemaVersion: 1,
    provider: 'azureDevOps',
    ticketIdPattern: '{SIM|PSE}_{numero}',
    briefingDir,
    azureDevOps: {
      authMode,
      org,
      ...(patB64 ? { patB64 } : {}),
    },
    ...(knownRepos.length > 0 ? { knownRepos } : {}),
  };

  fs.mkdirSync(path.join(CWD, '.claude'), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n  ✓ .claude/.local-config.json salvo');

  const templatePath = path.join(PKG_ROOT, '.mcp.json.template');
  if (fs.existsSync(templatePath)) {
    let mcp = fs.readFileSync(templatePath, 'utf8');
    mcp = mcp
      .replace(/\$\{AZURE_DEVOPS_ORG\}/g, org)
      .replace(/\$\{AZDO_AUTH_MODE:-azcli\}/g, authMode)
      .replace(/\$\{PERSONAL_ACCESS_TOKEN:-\}/g, patB64);
    fs.writeFileSync(path.join(CWD, '.mcp.json'), mcp);
    console.log('  ✓ .mcp.json gerado\n');
  }

  ensureGitignore(GITIGNORE_ENTRIES);
  console.log('  ✓ .gitignore atualizado\n');

  try {
    const { execSync } = require('child_process');
    if (authMode === 'azcli') {
      execSync('az account show', { stdio: 'ignore' });
      console.log('  ✓ az cli autenticado\n');
    }
  } catch (_) {
    console.log('  ⚠  Não foi possível validar autenticação az cli. Execute: az login\n');
  }

  console.log('✅ MCP configurado! Reinicie o Claude Code para carregar o servidor MCP.\n');
}

// ─── main ──────────────────────────────────────────────────────────────────

(async () => {
  switch (cmd) {
    case 'init':
      await cmdInit();
      break;
    case 'migrate':
      await cmdMigrate();
      break;
    case 'update':
      await cmdUpdate();
      break;
    case 'ide':
      await cmdIde();
      break;
    case 'profile':
      await cmdProfile();
      break;
    case 'setup-mcp':
      await cmdSetupMcp();
      break;
    default:
      console.log('\npraxio-oai-kit v2.0\n');
      console.log('Comandos disponíveis:');
      console.log('  npx praxio-oai-kit init                  Instala o kit no repositório');
      console.log('  npx praxio-oai-kit migrate               Migra repositório de v1.x para v2.0');
      console.log('  npx praxio-oai-kit update                Atualiza o kit (lê oai-kit.yaml)');
      console.log('  npx praxio-oai-kit ide add <claude|cursor>   Adiciona suporte a uma IDE');
      console.log('  npx praxio-oai-kit profile add <dev|qa|po>   Adiciona um perfil ao repositório');
      console.log('  npx praxio-oai-kit setup-mcp             Configura integração com Azure DevOps');
      console.log('  npx praxio-oai-kit init --force          Reinstala sobrescrevendo tudo\n');
  }
})();
