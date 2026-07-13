#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let errors = 0;

function check(filePath, label) {
  const full = path.join(ROOT, filePath);
  if (!fs.existsSync(full)) {
    console.error(`  MISSING: ${label || filePath}`);
    errors++;
  } else {
    console.log(`  OK: ${label || filePath}`);
  }
}

console.log('\nValidating praxio-oai-kit v2.0 structure...\n');

// ─── CLI ───────────────────────────────────────────────────────────────────
console.log('[ CLI ]');
check('bin/cli.js',                'bin/cli.js');
check('scripts/adapter-claude.js', 'scripts/adapter-claude.js');
check('scripts/adapter-cursor.js', 'scripts/adapter-cursor.js');
check('.mcp.json.template',        '.mcp.json.template');
check('CLAUDE.md',                 'CLAUDE.md');

// ─── OAI Kit core (.oai-kit/) ──────────────────────────────────────────────
console.log('\n[ .oai-kit/ — Source of Truth ]');
check('.oai-kit/oai-kit.md',                      'oai-kit.md (master instructions)');
check('.oai-kit/config/oai-kit.yaml.template',    'config/oai-kit.yaml.template');

// Policies
console.log('\n[ Policies ]');
check('.oai-kit/policies/coding-principles.md', 'policies/coding-principles');
check('.oai-kit/policies/security-policy.md',   'policies/security-policy');
check('.oai-kit/policies/release-policy.md',    'policies/release-policy');

// Shared agents
console.log('\n[ Shared Agents ]');
check('.oai-kit/agents/_shared/oai-kit-ticket-fetch.md', 'agents/_shared/ticket-fetch');

// Developer agents
console.log('\n[ Developer Agents ]');
const devAgents = [
  'oai-kit-bug-investigator',
  'oai-kit-impact-analyzer',
  'oai-kit-architecture-agent',
  'oai-kit-builder-agent',
  'oai-kit-test-validator',
  'oai-kit-azure-card-refiner',
  'oai-kit-pr-generator',
  'oai-kit-pr-reviewer',
  'oai-kit-release-agent',
  'oai-kit-learning-agent',
];
for (const a of devAgents) {
  check(`.oai-kit/agents/developer/${a}.md`, `agents/developer/${a}`);
}

// QA agents
console.log('\n[ QA Agents ]');
const qaAgents = [
  'oai-kit-qa-planner',
  'oai-kit-qa-refiner',
  'oai-kit-regression-planner',
  'oai-kit-acceptance-validator',
  'oai-kit-bug-analyzer',
];
for (const a of qaAgents) {
  check(`.oai-kit/agents/qa/${a}.md`, `agents/qa/${a}`);
}

// PO agents
console.log('\n[ PO Agents ]');
const poAgents = [
  'oai-kit-po-demand',
  'oai-kit-po-prototype',
  'oai-kit-po-refine-card',
  'oai-kit-po-scan-visual',
];
for (const a of poAgents) {
  check(`.oai-kit/agents/po/${a}.md`, `agents/po/${a}`);
}

// Developer commands
console.log('\n[ Developer Commands ]');
const devCmds = [
  'oai-kit-refine-card',
  'oai-kit-analyze-bug',
  'oai-kit-generate-fix',
  'oai-kit-run-regression',
  'oai-kit-open-pr',
  'oai-kit-release-check',
  'oai-kit-feature',
  'oai-kit-review-pr',
];
for (const c of devCmds) {
  check(`.oai-kit/commands/developer/${c}.md`, `commands/developer/${c}`);
}

// QA commands
console.log('\n[ QA Commands ]');
const qaCmds = [
  'oai-kit-qa-plan',
  'oai-kit-qa-refine-card',
  'oai-kit-qa-regression',
  'oai-kit-qa-validate',
  'oai-kit-qa-bug',
];
for (const c of qaCmds) {
  check(`.oai-kit/commands/qa/${c}.md`, `commands/qa/${c}`);
}

// PO commands
console.log('\n[ PO Commands ]');
const poCmds = [
  'oai-kit-po-document',
  'oai-kit-po-prototype',
  'oai-kit-po-refine-card',
  'oai-kit-po-scan-visual',
];
for (const c of poCmds) {
  check(`.oai-kit/commands/po/${c}.md`, `commands/po/${c}`);
}

// Shared commands
console.log('\n[ Shared Commands ]');
check('.oai-kit/commands/shared/oai-kit-bootstrap-repo.md', 'commands/shared/bootstrap-repo');
check('.oai-kit/commands/shared/oai-kit-update-speckit.md', 'commands/shared/update-speckit');

// Knowledge base
console.log('\n[ Knowledge Base ]');
check('.oai-kit/knowledge/qa/processes/README.md',        'knowledge/qa/processes');
check('.oai-kit/knowledge/qa/test-suites/README.md',      'knowledge/qa/test-suites');
check('.oai-kit/knowledge/qa/documentation/README.md',    'knowledge/qa/documentation');
check('.oai-kit/knowledge/po/visual-patterns/README.md',  'knowledge/po/visual-patterns');
check('.oai-kit/knowledge/po/demand-templates/README.md', 'knowledge/po/demand-templates');
check('.oai-kit/knowledge/po/project-context/README.md',  'knowledge/po/project-context');

// ─── Claude adapter output (.claude/) ──────────────────────────────────────
console.log('\n[ .claude/ — Claude Adapter Output ]');
check('.claude/oai-kit.md',                          '.claude/oai-kit.md (generated)');
check('.claude/agents/oai-kit-bug-investigator.md',  'claude/agents/bug-investigator');
check('.claude/agents/oai-kit-builder-agent.md',     'claude/agents/builder-agent');
check('.claude/commands/oai-kit-analyze-bug.md',     'claude/commands/analyze-bug');
check('.claude/commands/oai-kit-generate-fix.md',    'claude/commands/generate-fix');

// ─── Speckit skeleton ──────────────────────────────────────────────────────
console.log('\n[ Speckit Skeleton ]');
check('.speckit/domain/system-overview.md',             'speckit/domain/system-overview');
check('.speckit/domain/naming-guide.md',                'speckit/domain/naming-guide');
check('.speckit/domain/diagnostic-guide.md',            'speckit/domain/diagnostic-guide');
check('.speckit/architecture/architecture-overview.md', 'speckit/architecture/overview');
check('.speckit/architecture/risk-map.md',              'speckit/architecture/risk-map');
check('.speckit/known-issues/known-issues.md',          'speckit/known-issues');
check('.speckit/known-issues/anti-patterns.md',         'speckit/anti-patterns');
check('.speckit/decisions/adr-registry.md',             'speckit/adr-registry');
check('.speckit/business-rules/business-rules.md',      'speckit/business-rules');
check('.speckit/incidents/metrics-feed.jsonl',          'speckit/metrics-feed');

// ─── oai-flow templates ────────────────────────────────────────────────────
console.log('\n[ OAI Flow Templates ]');
check('.oai-flow/templates/bugreport-template.md', 'oai-flow/bugreport-template');
check('.oai-flow/templates/pr-template.md',        'oai-flow/pr-template');

// ─── Result ────────────────────────────────────────────────────────────────
console.log(`\n${errors === 0 ? '✅ All checks passed.' : `❌ ${errors} file(s) missing.`}\n`);
process.exit(errors === 0 ? 0 : 1);
