# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-18

### 06:39 UTC — 3 pages, highest severity high

**High — Frontend tools and generative UI** · _local snapshot edit, not an upstream change_

`/angular/claude-sdk-typescript/guides/frontend-tools-generative-ui` · route `/frontend-tools-generative-ui` · under “Register a browser tool”

1 code line, 1 prose line changed.

````diff
+ Showcase example builds a typed tool config around a writable signal:
+ type WeatherArgs = { city: string };
````

**High — Shared state and agent context** · _local snapshot edit, not an upstream change_

`/angular/claude-sdk-typescript/guides/shared-state` · route `/shared-state` · under “Read agent state” · in a `ts` block

6 code lines changed.

````diff
- 
+ <ul>
+ @for (note of state().notes; track note) {
+ <li>{{ note }}</li>
+ }
+ </ul>
````

**Medium — Quickstart** · _local snapshot edit, not an upstream change_

`/angular/claude-sdk-typescript/quickstart` · route `/quickstart` · under “Getting started”

1 heading changed.

````diff
+ ## Getting started
````
