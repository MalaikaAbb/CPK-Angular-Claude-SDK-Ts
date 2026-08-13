# CopilotKit + Claude Agent SDK (TypeScript) — Angular Test Harness

A navigable, working test harness for the Angular section of the CopilotKit Claude Agent SDK TypeScript documentation — each guide is a route that actually runs the thing it describes.

Tracks: **<https://docs.copilotkit.ai/angular/claude-sdk-typescript>**

| | |
|---|---|
| **Frontend** | Angular 22.1 · TypeScript 6.0 · Tailwind 4 · zoneless · port **4200** |
| **Runtime** | Copilot Runtime v2 Node listener · port **8200** |
| **Backend** | Claude Agent SDK TypeScript agent · Express 5 over AG-UI · port **8000** |
| **CopilotKit packages** | `@copilotkit/angular` 0.3.1 · `@copilotkit/runtime` 1.67.1 |
| **AG-UI packages** | `@ag-ui/client` 0.0.57 (runtime) · `@ag-ui/claude-agent-sdk` 0.0.3 (agent) |
| **Claude packages** | `@anthropic-ai/claude-agent-sdk` 0.2.141 · `@anthropic-ai/sdk` 0.116.0 |
| **Model** | `claude-sonnet-4-6` via `ClaudeAgentAdapter` |

---

## Architecture

Three processes, not two.

```
Browser (Angular 22, zoneless)
  │  @copilotkit/angular — provideCopilotKit, <copilot-chat>, signal APIs
  │  POST http://localhost:8200/api/copilotkit
  ▼
Copilot Runtime  ·  localhost:8200        ← Node, frontend/server.ts
  │  agents: { default, support } → new HttpAgent({ url })
  │  a2ui: {}  → A2UIMiddleware
  │  POST http://localhost:8000/          ← AG-UI over SSE
  ▼
Claude Agent SDK agent  ·  localhost:8000 ← TypeScript / Express, backend/main.ts
  │  new ClaudeAgentAdapter({...}).run(input) on POST "/"
  ▼
Model  (claude-sonnet-4-6)
```

- **Why the runtime is its own process.** Unlike the React/Next quickstart — where the runtime lives inside the Next app as an API route — Angular has no server route to host it, so the Copilot Runtime runs as a standalone Node process.
- **Why two agent ids.** `default` and `support` both resolve to the same Claude Agent SDK TypeScript process. `default` is what CopilotKit's prebuilt components use with no configuration; `support` exists so the Chat UI and Threads guides' snippets — written as `agentId="support"` — run exactly as published.
- **The model key never reaches the browser**, and never reaches the runtime either. Only the Claude Agent SDK process holds it.
- **The binding is the generic `HttpAgent`.** `ClaudeAgentAdapter` streams plain AG-UI events over a single Express `POST /`, so there is no Claude-specific server-side wrapper to import into the runtime.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 22+ (built on 24.16.0) | The Angular quickstart specifies Node 22. |
| npm | 10+ (built on 12.0.1) | Or pnpm/yarn. |
| Angular CLI | 20, 21, or 22 (built on 22.1.3) | `@copilotkit/angular` supports these three majors only. |
| Anthropic API key | — | **Required.** The agent cannot answer without one. |
| CopilotKit license key | — | **Optional.** Only affects the Threads and Memory routes. |

`@angular/cdk` must share your Angular major version. If you hit a peer-dependency error, pin it explicitly (`@angular/cdk@^22` on Angular 22).

---

## Setup

**1. Install the agent's dependencies**

```bash
cd backend && npm install && cd ..
```

**2. Install the frontend's dependencies**

```bash
cd frontend && npm install && cd ..
```

**3. Provide the model key**

`backend/main.ts` calls `dotenv.config()`, so the key can live in a `backend/.env` file or in the shell that starts the agent:

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-...
```

### Environment variables

| Variable | Read by | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | agent (`backend/`) | **Required.** The model key, read by the Claude Agent SDK. |
| `CLAUDE_MODEL` | agent (`backend/`) | Model id. Defaults to `claude-sonnet-4-6`. |
| `AGENT_PORT` | agent (`backend/`) | Agent port. Defaults to `8000`. |
| `CLAUDE_AGENT_URL` | runtime (`frontend/`) | Where the runtime finds the agent. Defaults to `http://localhost:8000/`. |
| `PORT` | runtime (`frontend/`) | Runtime port. Defaults to `8200`. |
| `COPILOTKIT_TELEMETRY_DISABLED` | runtime (`frontend/`) | Opt out of anonymous runtime telemetry. |

> The Angular app's `runtimeUrl` is hardcoded to `http://localhost:8200/api/copilotkit` in `frontend/src/app/app.config.ts`, following the quickstart. If you change `PORT`, change that too. If you change `AGENT_PORT`, set `CLAUDE_AGENT_URL` to match.

---

## Running the project

Two terminals. The agent gets its own; the runtime and the Angular dev server share one.

**Terminal 1 — the Claude Agent SDK agent:**

```bash
cd backend
npx tsx main.ts
```

There is no `start` script in `backend/package.json`; `tsx` is a devDependency and is invoked directly. Success looks like:

```
Claude Agent SDK listening on http://localhost:8000
```

**Terminal 2 — the runtime and the app together:**

```bash
cd frontend
npm run dev
```

`dev` runs the Copilot Runtime and `ng serve` side by side under `concurrently`, each line prefixed with the process that wrote it. Success looks like:

```
[runtime] Copilot Runtime listening at http://localhost:8200/api/copilotkit
[runtime] Claude Agent SDK TypeScript agent: http://localhost:8000/
[angular]   ➜  Local:   http://localhost:4200/
```

Ctrl-C stops both. `--kill-others` means a crash in either takes the other down rather than leaving half a stack running — better than a chat that silently can't reach anything.

To run them separately, with independent restarts, the underlying scripts are still there:

```bash
npm run runtime   # Copilot Runtime only, :8200
npm start         # Angular dev server only, :4200
```

Open **<http://localhost:4200>**.

### Verifying the stack

The Introduction route (`/`) probes both backends and shows a live connection panel — check it first if anything misbehaves. Two green dots means both processes are up.

The one-command check the quickstart prescribes:

```bash
curl -s http://localhost:8200/api/copilotkit/info
```

It should list `default` and `support` under `agents`, with `"a2uiEnabled": true`:

```json
{"version":"1.67.1","agents":{"default":{"name":"default",...},"support":{...}},"a2uiEnabled":true,...}
```

The agent's AG-UI endpoint answers only `POST /`, so a probing `GET http://localhost:8000/` returns **404**. That is still proof the process is listening, and the connection panel counts it as reachable. For an unambiguous 200, the agent also serves `GET /health`:

```bash
curl -s http://localhost:8000/health   # {"status":"ok"}
```

The agent sets no CORS headers, so the browser cannot read that 404 directly — the panel probes it as a `no-cors` request and treats "the server answered" as reachable. This never affects the chat itself: the browser talks to the runtime, and the runtime talks to the agent server-to-server, where CORS does not apply.

### Building for production

```bash
cd frontend
npm run build                 # → dist/frontend
npm run serve:ssr:frontend    # serve the SSR build
```

`gen:sources` runs automatically as a `prestart` / `prebuild` step. It reads the harness's real implementation files off disk into `src/app/lib/generated-sources.ts`, so the code shown on a route page is byte-identical to the code that runs. Run it by hand with `npm run gen:sources` if a source panel goes stale.

---

## What to expect

Every route shows a status badge and a link to the doc page it tests. Routes with a live feature are split in two:

| | |
|---|---|
| **`<route>`** | Notes, pass/fail criteria, and the exact source of the implementation. No live chat. |
| **`<route>/demo`** | Just the running feature, no sidebar or page chrome — built for screen recording. Reached via **Open demo ↗** in the route header. |

Demo routes share the app-root provider, so a conversation started in one demo continues in another — Quickstart, Frontend tools, A2UI, and Headless all drive the `default` agent and show the *same* conversation through four different interfaces.

| Route | Doc page | Quick check |
|---|---|---|
| `/` | Introduction | Two green dots in the connection panel. |
| `/quickstart` | Quickstart | Ask *Can you tell me a joke?* — tokens stream in and render as markdown. |
| `/chat-ui` | Chat UI and customization | Four surfaces in tabs; popup and sidebar trap focus and close on Escape. |
| `/frontend-tools-generative-ui` | Frontend tools and generative UI | Ask *What's the weather in Tokyo?* — the weather card renders from the agent's `getWeather` call. |
| `/a2ui` | A2UI schemas, styling, recovery | Inert until an `a2ui.catalog` is supplied — the route page explains why. |
| `/voice-multimodal` | Voice and multimodal input | Attachments work; transcription fails by design (no service configured). |
| `/human-in-the-loop` | Human-in-the-loop and interrupts | Ask it to delete your account with approval — nothing streams until you click. |
| `/shared-state` | Shared state and agent context | Set a priority, then ask the agent what it is. |
| `/threads` · `/memory` | Threads, memory, attachments, headless | Premium. Unlicensed, the locked state / fallback message *is* the pass. |
| `/attachments` · `/headless` | Threads, memory, attachments, headless | Picker, drag-and-drop, paste; and a chat with no CopilotKit chrome. |
| `/status` | — | Every route and its status in one table. |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Agent starts, first message errors | `ANTHROPIC_API_KEY` unset | Put it in `backend/.env` or export it in the terminal that runs the agent. |
| Chat sends, nothing streams back | Runtime or agent process down | Check the Introduction route's connection panel; `curl http://localhost:8200/api/copilotkit/info`. |
| `/info` returns nothing | Runtime not started | `npm run runtime` from `frontend/`. |
| Tool runs but the weather card doesn't render | Renderer name ≠ agent tool name | `registerRenderToolCall({ name })` matches by exact string. The frontend registers **`getWeather`**, and `backend/main.ts` declares the same name on its `agent_tools` MCP server. Renaming either side breaks the card silently. |
| A run starts, then hangs forever | The agent called a browser tool with no registered handler, so no result ever returns | Every tool the agent can call needs a matching `registerFrontendTool` / `registerHumanInTheLoop` mounted. |
| Chat renders unstyled | Missing stylesheet | `@import "@copilotkit/angular/styles.css";` must be in `frontend/src/styles.css`. |
| CORS errors from the browser | Runtime CORS off | Keep `cors: true` in `createCopilotNodeListener`. |
| Connection errors mentioning `localhost` | DNS resolving to IPv6 while the server binds IPv4 | Use `127.0.0.1` in `CLAUDE_AGENT_URL`. |
| Production build fails on size | CopilotKit pulls in markdown and syntax-highlighting deps | Budgets are already raised to 5 MB warning / 7 MB error in `angular.json`. |
| Peer-dependency error on install | `@angular/cdk` major mismatch | Install the matching major, e.g. `@angular/cdk@^22` on Angular 22. |
| Thread list empty, drawer shows a lock | No license key | Expected — not a bug. |
| Source panels say "Source not generated" | Generated map is stale | `npm run gen:sources` from `frontend/`. |

---

## Project structure

```
claude-sdk-ts/
├── README.md
│
├── frontend/                  # Angular 22 app + the Copilot Runtime process
│   ├── AGENTS.md              # Angular style rules this repo's own code follows
│   ├── server.ts              # ★ CopilotRuntime + HttpAgent binding  → :8200
│   ├── scripts/
│   │   └── generate-sources.ts  # ★ reads real files → generated-sources.ts
│   └── src/
│       ├── styles.css         # CopilotKit stylesheet + the guides' CSS verbatim
│       └── app/
│           ├── app.config.ts        # ★ provideCopilotKit, a2ui, openGenerativeUI
│           ├── app.routes.ts        # doc routes in chrome, demo routes outside it
│           ├── lib/
│           │   ├── nav-config.ts    # ★ single source of truth: routes, docs, status
│           │   └── generated-sources.ts   # GENERATED — do not edit
│           ├── components/          # harness chrome (nav, header, source, health)
│           ├── features/            # ★ the doc code that actually runs
│           │   ├── quickstart/  chat-ui/  tools/  a2ui/
│           │   └── media/  hitl/  shared-state/  threads/  memory/
│           │       attachments/  headless/
│           └── pages/               # one page per doc route + demos.ts + status
│
└── backend/                   # Claude Agent SDK TypeScript agent over AG-UI  → :8000
    ├── package.json
    └── main.ts                # ★ ClaudeAgentAdapter, getWeather tool, Express SSE
```

The nav, every route header, the demo links, and the status table all derive from `frontend/src/app/lib/nav-config.ts`, so a route's status is stated once.

**`features/` vs everything else.** Files under `features/` are doc code, kept as published. Every deviation from a published snippet is called out in the file's header comment. Everything outside `features/` is this harness's own code and follows `frontend/AGENTS.md`.

---

## References

**Getting Started** — [Angular + Claude Agent SDK TypeScript quickstart](https://docs.copilotkit.ai/angular/claude-sdk-typescript/quickstart)

**Guides** — [Chat UI and customization](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/chat-ui) · [Frontend tools and generative UI](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/frontend-tools-generative-ui) · [A2UI](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/a2ui) · [Voice and multimodal](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/voice-multimodal) · [Human-in-the-loop and interrupts](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/human-in-the-loop) · [Shared state and agent context](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/shared-state) · [Threads, memory, attachments, and headless UI](https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/threads-memory-attachments-headless)

**External** — [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) · [AG-UI protocol](https://ag-ui.com) · [Angular API reference](https://docs.copilotkit.ai/reference/angular)
