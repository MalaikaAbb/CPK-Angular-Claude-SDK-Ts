/**
 * Copilot Runtime for this harness.
 *
 * Shape comes from the Angular quickstart's Node runtime server
 * (https://docs.copilotkit.ai/angular/claude-sdk-typescript/quickstart), with
 * the agent bound to the Claude Agent SDK TypeScript backend in `../backend` —
 * the Angular + Claude Agent SDK TypeScript quickstart defers the backend step
 * to "register this backend as the `default` agent".
 *
 * That backend exposes a plain AG-UI endpoint: `ClaudeAgentAdapter` from
 * `@ag-ui/claude-agent-sdk` streams AG-UI events, and backend/main.ts serves
 * them from a single Express `POST /` as SSE. The quickstart's runtime snippet
 * binds it with the generic `HttpAgent` from `@ag-ui/client`, so that is the
 * binding here too; there is no Claude Agent SDK TypeScript-specific
 * server-side wrapper to import.
 *
 * `default` and `support` resolve to the same Claude Agent SDK TypeScript
 * process. `support` exists so the doc snippets that use `agentId="support"`
 * (Chat UI, Threads) run verbatim.
 *
 * `a2ui: {}` enables A2UIMiddleware for every registered agent, per
 * https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/a2ui
 */
import { createServer } from 'node:http';
import { CopilotRuntime } from '@copilotkit/runtime/v2';
import { createCopilotNodeListener } from '@copilotkit/runtime/v2/node';
import { HttpAgent } from '@ag-ui/client';

// backend/main.ts mounts the Claude Agent SDK TypeScript AG-UI endpoint on
// POST / and binds port 8000.
const agentUrl = process.env['CLAUDE_AGENT_URL'] ?? 'http://localhost:8000/';

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({ url: agentUrl }),
    support: new HttpAgent({ url: agentUrl }),
  },
  a2ui: {},
});

const port = Number(process.env['PORT'] ?? 8200);

createServer(
  createCopilotNodeListener({
    runtime,
    basePath: '/api/copilotkit',
    cors: true,
  }),
).listen(port, () => {
  console.log(`Copilot Runtime listening at http://localhost:${port}/api/copilotkit`);
  console.log(`Claude Agent SDK TypeScript agent: ${agentUrl}`);
});
