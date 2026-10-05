import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideCopilotKit, type SandboxFunction } from '@copilotkit/angular';
import { z } from 'zod';

import { routes } from './app.routes';

/**
 * Host function exposed to sandboxed Open Generative UI, verbatim from
 * https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/frontend-tools-generative-ui
 */
const setDashboardFilter: SandboxFunction<{ filter: string }> = {
  name: 'setDashboardFilter',
  description: 'Set the active dashboard filter',
  parameters: z.object({ filter: z.string() }),
  handler: async ({ filter }) => {
    sessionStorage.setItem('dashboard-filter', filter);
    return { applied: filter };
  },
};

/**
 * One provider at the application root, so a conversation started on any demo
 * route continues on every other route.
 *
 * `runtimeUrl` points at the Copilot Runtime from the quickstart — the
 * supported path, where the browser never talks to the Claude Agent SDK TypeScript agent
 * directly. The `HttpAgent` binding itself lives server-side in
 * frontend/server.ts.
 *
 * `a2ui.recovery` and `openGenerativeUI.sandboxFunctions` are the A2UI and
 * generative-UI guide options. `a2ui.catalog: productCatalog` is verbatim from
 * the A2UI guide's app.config.ts snippet; the guide never defines
 * `productCatalog`, so it is left undefined as published.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(),
    provideCopilotKit({
      runtimeUrl: 'http://localhost:8200/api/copilotkit',
      // a2ui: {
      //   catalog: productCatalog,
      //   recovery: { showAfterMs: 2_000, showAfterAttempts: 2 },
      // },
      openGenerativeUI: {
        // `sandboxFunctions` is typed `SandboxFunction[]`, i.e.
        // `SandboxFunction<Record<string, unknown>>[]`, so the guide's
        // `SandboxFunction<{ filter: string }>` is not assignable to it as
        // written. Cast at the array site, the same idiom the docs use for the
        // equivalent `component` variance problem. See README known issues.
        sandboxFunctions: [setDashboardFilter as unknown as SandboxFunction],
      },
    }),
  ],
};
