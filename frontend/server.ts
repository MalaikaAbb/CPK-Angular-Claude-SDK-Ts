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
 *
 * `CopilotKitIntelligence`, `intelligence` and `identifyUser` are the
 * TypeScript tab of "Connect your runtime", verbatim:
 * https://docs.copilotkit.ai/angular/claude-sdk-typescript/intelligence/quickstart
 * The guide never defines `authenticateApplicationUser`; the fixed local user
 * below is this harness's only addition. `CPK_INTELLIGENCE_API_KEY` comes from
 * `npx copilotkit@latest project select`, which writes it to `.env`.
 */
import { createServer } from 'node:http';
import {
  CopilotKitIntelligence,
  CopilotRuntime,
} from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from '@copilotkit/runtime/v2/node';
import { HttpAgent } from '@ag-ui/client';

// backend/main.ts mounts the Claude Agent SDK TypeScript AG-UI endpoint on
// POST / and binds port 8000.
const agentUrl = process.env['CLAUDE_AGENT_URL'] ?? 'http://localhost:8000/';

// Not from the guide: it leaves `authenticateApplicationUser` to the app.
// This harness has no user accounts, so it returns the fixed identity the
// guide allows for "a local, single-user demo". Replace before production.
async function authenticateApplicationUser(
  _request: Request,
): Promise<{ id: string; name: string } | null> {
  return { id: 'local-user', name: 'Local user' };
}

// Create the Intelligence client with your project API key. Keep this key on the server.
const intelligence = new CopilotKitIntelligence({
  apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
});

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({ url: agentUrl }),
    support: new HttpAgent({ url: agentUrl }),
  },
  a2ui: {},
  // Pass the Intelligence client to the runtime
  intelligence,
  // Identify the user from a verified session or token
  identifyUser: async (request) => {
    const user = await authenticateApplicationUser(request);
    if (!user) throw new Error("Unauthorized");
    return { id: user.id, name: user.name };
  },
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
