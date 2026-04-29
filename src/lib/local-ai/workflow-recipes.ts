export interface LocalAiWorkflowRecipe {
  id: string;
  title: string;
  purpose: string;
  runtime: 'local_ollama';
  riskTier: 'local-default';
  requiredModels: string[];
  commands: string[];
  artifacts: string[];
  verification: string[];
  agentParity: {
    humanSurface: string;
    toolSurface: 'planned_cli_or_mcp';
    note: string;
  };
}

const LOCAL_AI_WORKFLOW_RECIPES: LocalAiWorkflowRecipe[] = [
  {
    id: 'first-local-agent',
    title: 'First local agent loop',
    purpose:
      'Run the smallest local-first path: start OpenGrimoire, confirm Ollama, execute one local prompt workflow, and inspect the result in the cockpit.',
    runtime: 'local_ollama',
    riskTier: 'local-default',
    requiredModels: ['llama3.2:3b'],
    commands: ['npm run dev', 'ollama pull llama3.2:3b', 'npm run verify'],
    artifacts: ['data/opengrimoire.sqlite', 'data/local-ai-activity.jsonl'],
    verification: ['npm run verify', 'npx playwright test e2e/admin-moderation.spec.ts'],
    agentParity: {
      humanSurface: '/admin Local AI and Recipes tabs',
      toolSurface: 'planned_cli_or_mcp',
      note: 'The first pass exposes read-only recipe metadata. Execution should later gain CLI/MCP parity before adding write buttons.',
    },
  },
];

export function listLocalAiWorkflowRecipes(): LocalAiWorkflowRecipe[] {
  return LOCAL_AI_WORKFLOW_RECIPES;
}
