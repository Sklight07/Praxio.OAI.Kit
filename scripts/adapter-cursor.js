#!/usr/bin/env node
'use strict';

/**
 * Adapter Cursor — Gera .cursor/rules/ a partir de .oai-kit/
 *
 * Converte agentes OAI Kit para o formato de Cursor Rules (.mdc).
 * Cada agente vira uma rule que o Cursor pode aplicar ao contexto.
 */

const fs   = require('fs');
const path = require('path');

function parseYamlProfiles(yamlContent) {
  const profiles = [];
  const m = yamlContent.match(/^profiles:\s*\n((?:[ \t]+-[ \t]+\S+[ \t]*\n?)+)/m);
  if (m) {
    m[1].trim().split('\n').forEach(l => {
      const match = l.match(/^\s*-\s*(\S+)/);
      if (match) profiles.push(match[1].trim());
    });
  }
  return profiles.length > 0 ? profiles : ['developer'];
}

function agentToMdc(agentContent, agentName) {
  // Extract description from frontmatter
  const descMatch = agentContent.match(/^description:\s*(.+)$/m);
  const description = descMatch ? descMatch[1].trim() : agentName;

  // Strip YAML frontmatter
  const bodyMatch = agentContent.match(/^---[\s\S]*?---\n([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1] : agentContent;

  return `---
description: ${description}
alwaysApply: false
---

${body}`;
}

function generateWorkflowRule(profiles, oaiKitDir) {
  const agentList = [];

  for (const profile of profiles) {
    const profileDir = path.join(oaiKitDir, 'agents', profile);
    if (!fs.existsSync(profileDir)) continue;
    const files = fs.readdirSync(profileDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const name = f.replace('.md', '');
      agentList.push(`- **${name}** — ${profile}`);
    }
  }

  return `---
description: OAI Kit — fluxo de trabalho Praxio com agentes especializados por perfil
alwaysApply: true
---

# Praxio OAI Kit — Cursor

Você está em um repositório com o **Praxio OAI Kit v2.0** instalado.

## Agentes Disponíveis

${agentList.join('\n')}

## Padrões Praxio

### Branch
\`\`\`
feature/{SIGLA}_{SIM|PSE}_{numero}   ← origin: develop
hotfix/{SIGLA}_{SIM|PSE}_{numero}    ← origin: master/main
\`\`\`

### Commit
\`\`\`
{feat|fix}: {SIGLA}_{SIM|PSE}_{numero} #{ID_USER_STORY}

{descrição breve}

US: #{ID_FEATURE}
\`\`\`

## Princípios

- **Speckit First** — sempre consulte \`.speckit/\` antes de investigar código
- **Minimum Viable Patch** — zero refactoring além do necessário
- **Policies são Hard Stops** — \`.oai-kit/policies/\` são bloqueadores absolutos
- **4 Checkpoints Humanos** — nunca avance sem aprovação explícita do dev
- **RED→GREEN Obrigatório** — escreva o teste que falha antes de implementar

## Fontes de Verdade

- \`.oai-kit/\` — agentes, comandos, policies (não editar diretamente)
- \`.speckit/\` — memória institucional do projeto
- \`.oai-flow/\` — artifacts de trabalho do ticket atual
`;
}

/**
 * Executa o adapter Cursor para o repositório em `cwd`.
 */
function runAdapter(cwd, profiles) {
  const oaiKitDir  = path.join(cwd, '.oai-kit');
  const cursorDir  = path.join(cwd, '.cursor', 'rules');
  const yamlPath   = path.join(cwd, 'oai-kit.yaml');

  if (!profiles) {
    profiles = ['developer'];
    if (fs.existsSync(yamlPath)) {
      const yaml = fs.readFileSync(yamlPath, 'utf8');
      profiles = parseYamlProfiles(yaml);
    }
  }

  fs.mkdirSync(cursorDir, { recursive: true });

  // Generate always-on workflow rule
  const workflowRule = generateWorkflowRule(profiles, oaiKitDir);
  fs.writeFileSync(path.join(cursorDir, 'oai-kit-workflow.mdc'), workflowRule);

  // Policies rules (always apply)
  const policiesDir = path.join(oaiKitDir, 'policies');
  if (fs.existsSync(policiesDir)) {
    const policyFiles = fs.readdirSync(policiesDir).filter(f => f.endsWith('.md'));
    let policiesContent = '---\ndescription: Políticas e princípios obrigatórios do Praxio OAI Kit\nalwaysApply: true\n---\n\n';
    for (const pf of policyFiles) {
      const content = fs.readFileSync(path.join(policiesDir, pf), 'utf8');
      const bodyMatch = content.match(/^---[\s\S]*?---\n([\s\S]*)$/);
      policiesContent += (bodyMatch ? bodyMatch[1] : content) + '\n\n---\n\n';
    }
    fs.writeFileSync(path.join(cursorDir, 'oai-kit-policies.mdc'), policiesContent);
  }

  // Per-agent rules (manual apply)
  for (const profile of profiles) {
    const profileDir = path.join(oaiKitDir, 'agents', profile);
    if (!fs.existsSync(profileDir)) continue;
    const agentFiles = fs.readdirSync(profileDir).filter(f => f.endsWith('.md'));
    for (const af of agentFiles) {
      const agentName    = af.replace('.md', '');
      const agentContent = fs.readFileSync(path.join(profileDir, af), 'utf8');
      const mdcContent   = agentToMdc(agentContent, agentName);
      fs.writeFileSync(path.join(cursorDir, `${agentName}.mdc`), mdcContent);
    }
  }

  return profiles;
}

module.exports = { runAdapter, parseYamlProfiles };

// CLI: node adapter-cursor.js [cwd]
if (require.main === module) {
  const cwd = process.argv[2] || process.cwd();
  const profiles = runAdapter(cwd);
  console.log(`  ✓ Cursor adapter executado — perfis: ${profiles.join(', ')}`);
  console.log(`  ✓ Rules geradas em .cursor/rules/`);
}
