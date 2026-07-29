#!/usr/bin/env node
'use strict';

/**
 * praxio-oai-kit-conversao — extensão de conversão Delphi → GlobusWeb.
 *
 * Roda em cima de um repositório que já tem o praxio-oai-kit base instalado
 * (.oai-kit/ existente). Deposita o perfil `conversao` dentro de .oai-kit/,
 * registra o perfil em oai-kit.yaml, reexecuta o adapter da IDE ativa, e
 * conduz um wizard para configuração pessoal (paths do legado/Minerva, MCPs
 * opcionais de Oracle e Graphify) salva em .claude/.local-config.json.
 */

const fs = require('fs');
const path = require('path');
const rl = require('readline');
const { execSync } = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const args = process.argv.slice(2);
const cmd = args[0];

const GITIGNORE_ENTRIES = ['.mcp.json', '.claude/.local-config.json'];

function ask(question) {
  const iface = rl.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => iface.question(question, ans => { iface.close(); resolve(ans.trim()); }));
}

function copyDirContents(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
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

function parseYamlList(yaml, key) {
  const re = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-[ \\t]+\\S+[ \\t]*\\n?)+)`, 'm');
  const m = yaml.match(re);
  if (!m) return [];
  return m[1].trim().split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
}

function addToYamlList(yaml, key, value) {
  const list = parseYamlList(yaml, key);
  if (list.includes(value)) return yaml;
  list.push(value);
  const re = new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-[ \\t]+\\S+[ \\t]*\\n?)+)`, 'm');
  if (re.test(yaml)) {
    return yaml.replace(re, `${key}:\n${list.map(v => `  - ${v}`).join('\n')}\n`);
  }
  return `${yaml.trimEnd()}\n\n${key}:\n${list.map(v => `  - ${v}`).join('\n')}\n`;
}

function commandExists(command) {
  try {
    execSync(process.platform === 'win32' ? `where ${command}` : `which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

function loadLocalConfig() {
  const p = path.join(CWD, '.claude', '.local-config.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return {}; }
}

function saveLocalConfig(config) {
  const dir = path.join(CWD, '.claude');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.local-config.json'), JSON.stringify(config, null, 2));
}

function runAdapters(ides, profiles) {
  for (const ide of ides) {
    try {
      if (ide === 'claude') {
        const adapter = require('praxio-oai-kit/scripts/adapter-claude');
        adapter.runAdapter(CWD, profiles);
        console.log(`  ✓ Adapter Claude reexecutado — perfis: ${profiles.join(', ')}`);
      } else if (ide === 'cursor') {
        const adapter = require('praxio-oai-kit/scripts/adapter-cursor');
        adapter.runAdapter(CWD, profiles);
        console.log('  ✓ Adapter Cursor reexecutado');
      }
    } catch (e) {
      console.log(`  ⚠  Não consegui reexecutar o adapter '${ide}' automaticamente (${e.message}).`);
      console.log(`     Rode manualmente: npx praxio-oai-kit update`);
    }
  }
}

// ─── cmdInit ───────────────────────────────────────────────────────────────

async function cmdInit() {
  console.log('\n🔧 Instalando extensão de Conversão (praxio-oai-kit-conversao)...\n');

  const oaiKitDir = path.join(CWD, '.oai-kit');
  if (!fs.existsSync(oaiKitDir)) {
    console.log('  ✗ .oai-kit/ não encontrado neste repositório.');
    console.log('    Rode primeiro: npx praxio-oai-kit init\n');
    return;
  }

  const yamlPath = path.join(CWD, 'oai-kit.yaml');
  if (!fs.existsSync(yamlPath)) {
    console.log('  ✗ oai-kit.yaml não encontrado. Rode primeiro: npx praxio-oai-kit init\n');
    return;
  }
  let yaml = fs.readFileSync(yamlPath, 'utf8');
  const ides = parseYamlList(yaml, 'ides');
  if (ides.length === 0) ides.push('claude');

  // 1) Deposita os arquivos do perfil conversao dentro de .oai-kit/
  copyDirContents(path.join(PKG_ROOT, 'agents'), path.join(oaiKitDir, 'agents', 'conversao'));
  // agents/_shared foi copiado junto acima como subpasta "_shared" dentro de agents/conversao — mover para o _shared comum
  const nestedShared = path.join(oaiKitDir, 'agents', 'conversao', '_shared');
  if (fs.existsSync(nestedShared)) {
    copyDirContents(nestedShared, path.join(oaiKitDir, 'agents', '_shared'));
    fs.rmSync(nestedShared, { recursive: true, force: true });
  }
  copyDirContents(path.join(PKG_ROOT, 'commands'), path.join(oaiKitDir, 'commands', 'conversao'));
  copyDirContents(path.join(PKG_ROOT, 'knowledge', 'conversao'), path.join(oaiKitDir, 'knowledge', 'conversao'));
  copyDirContents(path.join(PKG_ROOT, 'policies'), path.join(oaiKitDir, 'policies'));
  console.log('  ✓ Perfil "conversao" depositado em .oai-kit/');

  // 2) Registra o perfil em oai-kit.yaml
  yaml = addToYamlList(yaml, 'profiles', 'conversao');
  fs.writeFileSync(yamlPath, yaml);
  console.log('  ✓ oai-kit.yaml atualizado com o perfil "conversao"');

  // 3) Reexecuta adapters da(s) IDE(s) já configurada(s)
  const profiles = parseYamlList(yaml, 'profiles');
  runAdapters(ides, profiles);

  // 4) Wizard de configuração pessoal
  console.log('\n📋 Configuração da extensão (gravada em .claude/.local-config.json, pessoal/gitignored)\n');

  const config = loadLocalConfig();
  config.conversao = config.conversao || {};

  const legacyRepoPath = await ask('Caminho local do repositório legado Delphi (ex: C:\\Praxio\\Globus\\src\\Globus): ');
  if (legacyRepoPath) config.conversao.legacyRepoPath = legacyRepoPath;

  const knowledgeBasePath = await ask('Caminho local da base de conhecimento central (ex: C:\\Praxio\\GlobusEvo.Minerva): ');
  if (knowledgeBasePath) config.conversao.knowledgeBasePath = knowledgeBasePath;
  // Docs de arquitetura/padrões do GlobusWeb vivem dentro do próprio GlobusEvo.Minerva
  // (pasta padroes-globusweb/) — não é um path separado a configurar.

  const wantsOracle = (await ask('\nDeseja configurar o MCP de exploração Oracle (praxio-oracle-discover-mcp)? (s/N): ')).toLowerCase();
  if (wantsOracle === 's' || wantsOracle === 'sim') {
    if (!commandExists('praxio-oracle-discover-mcp')) {
      const install = (await ask('  Pacote não encontrado globalmente. Instalar agora via "npm install -g praxio-oracle-discover-mcp"? (s/N): ')).toLowerCase();
      if (install === 's' || install === 'sim') {
        try {
          execSync('npm install -g praxio-oracle-discover-mcp', { stdio: 'inherit' });
        } catch (e) {
          console.log('  ⚠  Falha ao instalar. Instale manualmente e rode "praxio-oracle-discover-mcp init" neste repositório.');
        }
      } else {
        console.log('  ℹ  Pulei a instalação. Rode "npm install -g praxio-oracle-discover-mcp" e depois "praxio-oracle-discover-mcp init" quando quiser.');
      }
    }
    if (commandExists('praxio-oracle-discover-mcp')) {
      console.log('  → Rodando o wizard próprio do praxio-oracle-discover-mcp (connection string, credenciais)...');
      try {
        execSync('praxio-oracle-discover-mcp init', { stdio: 'inherit', cwd: CWD });
        config.conversao.oracleMcpConfigured = true;
      } catch (e) {
        console.log('  ⚠  Wizard do Oracle MCP não concluído. Rode "praxio-oracle-discover-mcp init" manualmente depois.');
        config.conversao.oracleMcpConfigured = false;
      }
    } else {
      config.conversao.oracleMcpConfigured = false;
    }
  } else {
    config.conversao.oracleMcpConfigured = false;
  }

  const wantsGraphify = (await ask('\nDeseja usar o Graphify (graphify.net) para indexar código como grafo de conhecimento (legado e/ou GlobusWeb)? (s/N): ')).toLowerCase();
  if (wantsGraphify === 's' || wantsGraphify === 'sim') {
    console.log('  ℹ  Instale o Graphify conforme https://graphify.net e rode "/graphify ." no(s) diretório(s) desejado(s).');
    console.log('     Ainda não validamos cobertura de Object Pascal/Delphi — confirme antes de depender dele no lado legado.');
    config.conversao.graphifyConfigured = true;
  } else {
    config.conversao.graphifyConfigured = false;
  }

  saveLocalConfig(config);
  console.log('\n  ✓ .claude/.local-config.json atualizado (chave "conversao")');

  ensureGitignore(GITIGNORE_ENTRIES);
  console.log('  ✓ .gitignore conferido');

  console.log('\n✅ Extensão de Conversão instalada!\n');
  console.log('Próximos passos:');
  console.log('  /oai-kit-converter-tela {ID_AZURE}                         — Modo A (só Azure)');
  console.log('  /oai-kit-converter-tela --fontes [caminho1] [caminho2]...  — Modo B (só fontes locais)');
  console.log('  /oai-kit-converter-tela {ID_AZURE} --fontes [...]          — Modo C (combinação)\n');
}

// ─── main ──────────────────────────────────────────────────────────────────

(async () => {
  switch (cmd) {
    case 'init':
      await cmdInit();
      break;
    default:
      console.log('\npraxio-oai-kit-conversao\n');
      console.log('Comandos disponíveis:');
      console.log('  npx praxio-oai-kit-conversao init   Instala o perfil de conversão no repositório atual\n');
      console.log('Pré-requisito: o repositório já deve ter o praxio-oai-kit base instalado (npx praxio-oai-kit init).\n');
  }
})();
