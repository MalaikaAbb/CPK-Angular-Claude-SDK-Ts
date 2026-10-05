// /**
//  * The two `features/a2ui/a2ui-catalogs.ts` snippets from "Choose a schema
//  * strategy", verbatim.
//  * https://docs.copilotkit.ai/angular/claude-sdk-typescript/guides/a2ui
//  *
//  * Deviation: the guide shows no imports; the two below are the only additions.
//  *
//  * Not self-contained, left as published: the guide never defines
//  * `dynamicString`, `beautifulCatalog`, `declarativeCatalog` or `fixedCatalog`,
//  * and never shows how `fixedDefinitions` becomes a catalog.
//  */
// import { z } from 'zod';
// import type { A2UIConfig } from '@copilotkit/angular';

// const fixedDefinitions = {
//   Card: { props: z.object({ child: z.string() }) },
//   Title: { props: z.object({ text: dynamicString }) },
//   Airport: { props: z.object({ code: dynamicString }) },
//   Arrow: { props: z.object({}) },
//   AirlineBadge: { props: z.object({ name: dynamicString }) },
//   PriceTag: { props: z.object({ amount: dynamicString }) },
//   Button: {
//     props: z.object({
//       child: z.string(),
//       variant: z.enum(["primary", "secondary", "ghost"]).optional(),
//       action: z.unknown().optional(),
//     }),
//   },
// };

// export function a2uiConfigForFeature(feature: string): A2UIConfig | undefined {
//   switch (feature) {
//     case "beautiful-chat":
//       return { catalog: beautifulCatalog };
//     case "declarative-gen-ui":
//       return { catalog: declarativeCatalog };
//     case "a2ui-recovery":
//       return {
//         catalog: declarativeCatalog,
//         recovery: { showAfterMs: 2_000, showAfterAttempts: 2 },
//       };
//     case "a2ui-fixed-schema":
//       return { catalog: fixedCatalog };
//     default:
//       return undefined;
//   }
// }
