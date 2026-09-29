# Agent control — `@plurid/plurid-react/agent`

An AI agent can operate a plurid application embedded in a page. It reads the space as a reader
would: the planes, their text and links, the docked page, the selection. It acts through fourteen
tools that open, follow, close, frame, arrange and configure. Each tool is described for a model and
validated before it runs. Each answers once the space has come to rest, and the answer carries the
space as it is then.

The agent acts through the same bus a host uses (`api.pubsub`) and reads the same store
(`api.store`). It can do nothing a host cannot, and a host can refuse any call. The module depends on
no model provider: hand `tools()` or `anthropicTools()` to whatever runs the model, and route its tool
calls to `call()`.

```ts
import { createPluridAgent, usePluridAgent } from '@plurid/plurid-react/agent';
```

## Three ways in

| Transport | Who runs the model | How |
| --- | --- | --- |
| **Your loop** | your server (the API key stays there) | `agent.anthropicTools({ strict: true })` or `agent.tools()`, then `agent.call(name, input)` for each tool call ([with Claude](#with-claude)) |
| **WebMCP** | the browser's own agent | `agent.exposeToWebMCP()`, or `usePluridAgent(api, { webmcp: true })` ([WebMCP](#webmcp)) |
| **Page global** | a browser-automation agent that evaluates script in the page | `agent.exposeGlobal()` → `window.__PLURID_AGENT__.call(name, input)` ([automation](#browser-automation-agents)) |

## Quick start

In React, the hook creates the agent once the application is ready, and withdraws it on unmount:

```tsx
import { useState } from 'react';
import { PluridApplication, type PluridApi } from '@plurid/plurid-react';
import { usePluridAgent } from '@plurid/plurid-react/agent';

const App = () => {
    const [api, setApi] = useState<PluridApi>();
    // `undefined` until the application is ready
    const agent = usePluridAgent(api, { webmcp: true });

    return (
        <PluridApplication
            planes={planes}
            view={view}
            onReady={setApi}
        />
    );
};
```

Anywhere else, create it from the api that `onReady` gives. The `ref` handle also works, since it
extends the api:

```ts
const agent = createPluridAgent(api, { readOnly: false });
const result = await agent.call('plurid_observe');
```

## The tools

| Tool | What it does | Changes the space |
| --- | --- | --- |
| `plurid_observe` | Reads the space: every plane's id, route, title, text excerpt, links, and whether it is shown, docked, on screen and selected; plus the camera, the selection and the history. `planeID` reads one plane's whole text. | no |
| `plurid_follow_link` | Clicks a link inside a plane, as a reader would. In the page presentation it goes to the linked page; in a space it opens the linked plane beside its parent, or closes it if already open. Matches the link's text or its route. | yes |
| `plurid_open_plane` | Opens a route as a new plane: a child of `parentPlaneID`, or a new root. | yes |
| `plurid_go_to_plane` | Brings a plane into view: docks on it (page presentation) or frames it (`framing: 'plane' \| 'pair'`). Reopens a closed plane first. | yes |
| `plurid_close_plane` | Closes a plane. It stays in the space, hidden, until it is brought back. | yes |
| `plurid_remove_plane` | Removes a plane and every plane opened from it. Marked destructive; `plurid_history` undoes it. | yes |
| `plurid_scroll_plane` | Scrolls a plane's content `to` its top or bottom, or `by` a number of pixels. | yes |
| `plurid_camera` | `fit`, `home`, `reset`, `reveal`, `dock`, `frame` (several planes), or `move` (yaw, pitch, pan, zoom). | yes |
| `plurid_select` | `set`, `toggle`, `all`, `invert` or `clear` the selection. | yes |
| `plurid_arrange` | `move` planes by pixels; `align`, `distribute` or `duplicate` the selection. | yes |
| `plurid_history` | `undo` or `redo`, `steps` at a time. The camera is not in the history. | yes |
| `plurid_bookmark` | `save`, `go` to, or `remove` a named viewpoint. | yes |
| `plurid_command` | Runs one of the keyboard commands by id (`frameActive`, `copy`, `toggleIsolate`, …), exactly as its key would. The id is an enum in the schema, so a model sees the list. | yes |
| `plurid_configure` | Sets the `presentation` (`page` \| `space`) or the roots' `layout` (`columns` with `COLUMNS`, `rows` with `ROWS`). | yes |

Every tool's `inputSchema` is a JSON Schema with `additionalProperties: false` and no numeric or
string-length constraints. The same schemas therefore work as MCP tools, as WebMCP tools, and as
Claude tools in strict mode.

## What the model reads

`plurid_observe`, and the answer of every other tool, carries an observation:

```json
{
  "presentation": "space",
  "docked": null,
  "active": "plurid://example.com/geometry@0",
  "layout": "COLUMNS",
  "camera": { "yaw": -12.5, "pitch": 0, "scale": 0.82, "moving": false },
  "view": { "width": 1280, "height": 800 },
  "planes": [
    {
      "id": "plurid://example.com/geometry@0",
      "route": "/geometry",
      "title": "Geometry",
      "parent": null,
      "children": ["plurid://example.com/geometry/detail@a1b2"],
      "shown": true,
      "docked": false,
      "selected": false,
      "onScreen": true,
      "text": "GEOMETRY G-01 vertices 2 046 faces 4 092 … open detail →",
      "links": [{ "text": "open detail →", "route": "/geometry/detail", "open": true }]
    }
  ],
  "selection": [],
  "history": { "canUndo": true, "canRedo": false },
  "bookmarks": []
}
```

- **Text comes from the document, not the layout.** A page the camera is not docked on is inert and
  hidden, but it is still in the document, and the model reads it to decide where to go. Script and
  style text are skipped, and blocks are separated. Each plane's excerpt is `textLength` characters
  (600 by default; `…` marks a cut). `plurid_observe { planeID }` reads the whole text.
- **The title** is the plane's declared document title (`planes[].head.title`), else its path.
- **`onScreen`** intersects the plane's box with the view's, as laid out by the browser.
- **Nothing is in pixels or matrices.** The tools take ids, link text and routes, so a model never
  needs a coordinate.

## Results and errors

`call` never throws. A result is either:

```ts
{ ok: true, tool, summary, changes: { opened, closed, removed, docked? }, settled, observation }
{ ok: false, tool, error: { code, message } }
```

- `summary` says what was done, in a sentence.
- `changes` lists the plane ids opened, closed and removed during the call, and the docked page
  before and after when it changed.
- `settled: false` means the space was still moving when `settleTimeout` ran out.
- The error message tells the model what to do next, and names the ids or links that do exist.

| Code | Meaning |
| --- | --- |
| `unknown_tool` | No such tool, or not offered here (the message lists the offered ones). |
| `invalid_input` | The input does not fit the schema, or the combination does not make sense (`columns` with a `ROWS` layout). |
| `not_found` | No plane with that id, no link with that text, no bookmark with that name. |
| `ambiguous` | The link text matches links to different routes; name one by its route. |
| `not_allowed` | `onCall` refused the call. |
| `unavailable` | The plane is closed, or not rendered (culled). Bring it into view first. |
| `no_effect` | Nothing to do: already closed, nothing to undo, a route no plane is registered at, a command that did not run. |
| `failed` | The action threw. |

## Guardrails

- **`tools: [...]`** offers only the named tools. **`readOnly: true`** offers only `plurid_observe`.
- **`onCall({ name, input })`** is asked before every call that passed validation. Return `false` (or
  throw) to refuse; the model receives `not_allowed`. Use it to confirm a destructive call with the
  reader, to log, or to rate-limit.
- **Every input is validated** against its tool's schema. Every plane id must exist, and a route must
  be registered. Model output is untrusted input, and it is treated as such.
- **One call at a time.** Parallel tool calls run in the order they were made, so each answer
  describes the space that call left.
- **`exposeGlobal` is opt-in.** Once exposed, any script in the page can call the tools. Expose only
  where that is acceptable (a development build, an automation run).
- **Several applications on one page:** give each agent its `root` (the element around that
  application), or `observe` reads every application's planes.

Options: `root`, `tools`, `readOnly`, `onCall`, `settleTimeout` (4000 ms), `textLength` (600). The
hook adds `webmcp` and `global` (`true` or a name).

## With Claude

The model runs on your server, so the API key never reaches the browser. The tools run in the page,
where the space is. So the loop crosses the network once per turn: the page sends the conversation
to the server, the server asks Claude, and the page runs the tool calls that come back. This is the
case for a manual loop rather than the SDK's tool runner, whose tools run where the runner runs.

The server route, with the official SDK (`@anthropic-ai/sdk`):

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY

app.post('/api/plurid-agent', async (request, response) => {
    const { messages, tools } = request.body;
    const message = await client.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        system: 'You operate a plurid space embedded in this page: planes of content, joined by links, in 3D. Call plurid_observe first; act with the other tools; answer the reader in one or two sentences when done.',
        // strict: the input always fits the schema; tool_choice stays `auto` (forcing a tool is refused on this model)
        tools,
        messages,
    });
    response.json(message);
});
```

The page's loop:

```ts
import type Anthropic from '@anthropic-ai/sdk';
import type { PluridAgent } from '@plurid/plurid-react/agent';

export const runTask = async (agent: PluridAgent, task: string) => {
    const tools = agent.anthropicTools({ strict: true });
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: task }];

    for (let turn = 0; turn < 24; turn += 1) {
        const message: Anthropic.Message = await fetch('/api/plurid-agent', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ messages, tools }),
        }).then((answer) => answer.json());
        messages.push({ role: 'assistant', content: message.content });

        // a turn cut off (max_tokens) or refused may hold a partial tool call: run none of it
        if (message.stop_reason !== 'tool_use') {
            return message;
        }
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const block of message.content) {
            if (block.type !== 'tool_use') {
                continue;
            }
            const result = await agent.call(block.name, block.input);
            results.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result),
                ...(result.ok ? {} : { is_error: true }),
            });
        }
        messages.push({ role: 'user', content: results });
    }
    throw new Error('the task took more than 24 turns');
};
```

An observation is a few kilobytes per call. For long sessions, lower `textLength`, or have the model
call `plurid_observe { planeID }` for the plane it needs.

## WebMCP

WebMCP is a proposal, not a shipped standard. It lets a page offer tools to an agent running in the
browser. `exposeToWebMCP()` looks for a context at `document.modelContext` (the proposal's current
home), then at `navigator.modelContext` (earlier drafts). It registers each tool as
`{ name, description, inputSchema, annotations, execute }`, where `execute` answers with
`{ content: [{ type: 'text', text: JSON.stringify(result) }] }`, plus `isError: true` on a failure.

- **Result:** `{ available, registered, refused, dispose }`.
- **Where there is no context:** `available` is `false` and nothing is registered.
- **When one name is refused** (say, already taken), the others still register.
- **`dispose()`** aborts the registration's signal, which is the proposal's way to withdraw. It also
  calls `unregisterTool` where an older context still offers it.

## Browser-automation agents

An agent that drives a browser (Playwright, Puppeteer, or a browser MCP server) can call the tools
with script instead of pixels:

```ts
// in the page: createPluridAgent(api).exposeGlobal();
const result = await page.evaluate(() => window.__PLURID_AGENT__.call('plurid_follow_link', {
    planeID: 'plurid://example.com/docs@0',
    link: 'getting started',
}));
```

`window.__PLURID_AGENT__` carries `{ tools, call, observe }`.

## Limits

- **Links** are the `PluridLink`s inside a plane. A plain `<a>` is the page's, not the space's, and
  is not listed.
- **A culled or detached plane** has no content in the document (`space.culling.detach`), so its text
  is empty and `plurid_follow_link` answers `unavailable`. `plurid_go_to_plane` brings it back first.
- **Text only.** Images, canvases and video are not described. A plane that needs them described
  should say so in its text (`alt`, captions).
- **The camera is not in the history.** `plurid_history` undoes the arrangement (planes opened,
  closed, removed, moved), not the view.
- **Timing.** A call answers once the camera is idle and the layout has stopped moving for three
  frames, or after `settleTimeout`. An application that animates forever answers `settled: false`.

Tests: `source/agent/__tests__/agent.test.tsx` (jsdom) covers the catalog, validation, each tool, the
guardrails, serialization and WebMCP. `fixtures/render-test/e2e/agent.spec.ts` (Chromium,
`?agent=1`) runs an agent through the real harness: a link followed in a space, a plane closed,
reopened and undone, the page presentation's pages and the address bar, and a WebMCP context.
