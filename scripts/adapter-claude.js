#!/usr/bin/env node
'use strict';

/**
 * Adapter Claude — Gera .claude/ a partir de .oai-kit/
 *
 * Lê oai-kit.yaml para saber quais perfis estão instalados,
 * depois copia agentes e comandos de cada perfil para .claude/agents/ e .claude/commands/.
 */

const fs = require('fs');
const path = require('path');

function parseYamlProfiles(yamlContent) {
  const profiles = [];
  const profilesMatch = yamlContent.match(/^profiles:\s*\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m);
  if (profilesMatch) {
    const lines = profilesMatch[1].trim().split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*-\s*(\S+)/);
      if (m) profiles.push(m[1].trim());
    }
  }
  return profiles.length > 0 ? profiles : ['developer'];
}

function parseYamlIDEs(yamlContent) {
  const ides = [];
  const idesMatch = yamlContent.match(/^ides:\s*\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m);
  if (idesMatch) {
    const lines = idesMatch[1].trim().split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*-\s*(\S+)/);
      if (m) ides.push(m[1].trim());
    }
  }
  return ides.length > 0 ? ides : ['claude'];
}

function copyDirContents(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

/**
 * Executa o adapter Claude para o repositório em `cwd`.
 * @param {string} cwd - raiz do repositório destino
 * @param {string[]} [profiles] - lista de perfis; se omitido, lê de oai-kit.yaml
 */
function runAdapter(cwd, profiles) {
  const oaiKitDir = path.join(cwd, '.oai-kit');
  const claudeDir = path.join(cwd, '.claude');
  const yamlPath  = path.join(cwd, 'oai-kit.yaml');

  if (!profiles) {
    profiles = ['developer'];
    if (fs.existsSync(yamlPath)) {
      const yaml = fs.readFileSync(yamlPath, 'utf8');
      profiles = parseYamlProfiles(yaml);
    }
  }

  const agentsDir   = path.join(claudeDir, 'agents');
  const commandsDir = path.join(claudeDir, 'commands');
  fs.mkdirSync(agentsDir,   { recursive: true });
  fs.mkdirSync(commandsDir, { recursive: true });

  // Shared agents (_shared/)
  const sharedAgentsSrc  = path.join(oaiKitDir, 'agents', '_shared');
  const sharedAgentsDest = path.join(agentsDir, '_shared');
  copyDirContents(sharedAgentsSrc, sharedAgentsDest);

  // Profile agents + commands
  for (const profile of profiles) {
    copyDirContents(path.join(oaiKitDir, 'agents', profile),   agentsDir);
    copyDirContents(path.join(oaiKitDir, 'commands', profile), commandsDir);
  }

  // Shared commands (shared across profiles)
  copyDirContents(path.join(oaiKitDir, 'commands', 'shared'), commandsDir);

  // Master instructions → .claude/oai-kit.md
  const masterSrc  = path.join(oaiKitDir, 'oai-kit.md');
  const masterDest = path.join(claudeDir, 'oai-kit.md');
  if (fs.existsSync(masterSrc)) {
    fs.copyFileSync(masterSrc, masterDest);
  }

  return profiles;
}

module.exports = { runAdapter, parseYamlProfiles, parseYamlIDEs };

// CLI direto: node adapter-claude.js [cwd]
if (require.main === module) {
  const cwd = process.argv[2] || process.cwd();
  const profiles = runAdapter(cwd);
  console.log(`  ✓ Claude adapter executado — perfis: ${profiles.join(', ')}`);
}
