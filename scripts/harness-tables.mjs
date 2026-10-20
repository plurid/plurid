/**
 * The render-test harness's rows of docs/HARNESS.md, as text (`scripts/generate-tables.mjs`).
 *
 * Every fixture step kind is spelled out, and one this file does not know fails the generation: the
 * steps fell back to `plane → route`, so a `setPlanes` or a `publish` step printed
 * `undefined → undefined`, and a `visible` expectation printed `[object Object]` (2026-10-20). The
 * assertion globals are written by hand, and the generation fails when the harness publishes one the
 * sentence does not name, which is how `__rtChanged` and four others went missing.
 */

/** A fixture step (`FixtureStep`, `fixtures/render-test/src/fixtures/catalog.ts`) as a table cell. */
export const stepText = (step) => {
    switch (step.kind) {
        case 'clickLink':
            return step.plane + ' → ' + step.route;
        case 'scroll':
            return step.plane + ' ↓ ' + step.top;
        case 'dock':
            return '⌂ ' + step.plane;
        case 'key':
            return '⌘ ' + step.press;
        case 'focus':
            return '⌨ ' + step.control;
        case 'move':
            return '⇢ ' + step.plane + ' ' + step.deltaX + ',' + step.deltaY;
        case 'setPlanes':
            return 'view.setPlanes ' + step.view.join(' ');
        case 'spawn':
            return 'space.spawnPlane ' + step.plane + ' → ' + step.route;
        case 'publish':
            return step.topic;
        default:
            throw new Error('[docs.tables] a fixture step of kind `' + step.kind + '` has no text: add it to scripts/harness-tables.mjs');
    }
};

const valueText = (value) => {
    if (Array.isArray(value)) {
        return '[' + value.map(valueText).join(', ') + ']';
    }
    if (value && typeof value === 'object') {
        // a `VisibleExpectation`: the plane must read at least this wide
        if (typeof value.route === 'string' && typeof value.minWidth === 'number') {
            return value.route + ' ≥ ' + value.minWidth + ' px' + (value.unoccluded ? ' (unoccluded)' : '');
        }
        return JSON.stringify(value);
    }
    return String(value);
};

/** A fixture's expectations (`FixtureExpectations`) as a table cell. */
export const expectationsText = (expectations) => Object.entries(expectations || {})
    .map(([key, value]) => key + ': ' + valueText(value))
    .join(', ') || '-';

/** The window globals the harness's assertion surface publishes, as docs/HARNESS.md describes them. */
export const ASSERTION_GLOBALS = 'Published on `window` once the application is ready (`src/harness/globals.ts`): `__pluridApi` (the `onReady` api), `__rtCamera()` (the live camera), `__rtTree()` (the live space tree), `__rtViewpoint2()` (the v2 viewpoint), `__rtFlags()` (the parsed flags), `__rtPlanes()` (the declared sizes by route), `__rtInspect()` (the api\'s inspection), `__rtMounted()` (the planes whose content is mounted: shells, contents and detached shells), `__rtChanged` (every `space.changed` kind reported, in order), `__rtPerf` (dispatch / frame counters), `__rtChanges` (the changed slice keys per store notification), `__rtBench` (`?bench=1`), `__rtRootsSize()` (the roots container\'s applied size), `__rtUnhandled` (unhandled key codes), `__rtStore` (the memory adapter\'s map), `__rtViewpoint` / `__rtContent` / `__rtRestored` (the persistence callbacks), `__rtPlaneLens` / `__rtMediaImageLoaded` (`?media=1`), with `?router=1` `__rtRouterReady` (the api the router\'s `onReady` hands over) and `__rtRouterRotation` (the pitch read just after a command published from `onReady`), and with `?agent=1` `__PLURID_AGENT__` (the agent control API) and `__rtWebMCP` (its WebMCP registration).';

/** Every `__rt…` global and `__pluridApi` the given harness sources assign or read. */
export const publishedGlobals = (sources) => [...new Set(
    sources.flatMap((text) => text.match(/\b__(?:rt[A-Za-z0-9]+|pluridApi)\b/g) ?? []),
)].sort();

/** The names in `names` the sentence does not mention. */
export const undocumentedGlobals = (sentence, names) => names.filter((name) => !sentence.includes('`' + name));

/** The `__rt…` globals and `__pluridApi` the sentence mentions (`__PLURID_AGENT__` is the agent package's). */
export const namedGlobals = (sentence) => [...sentence.matchAll(/`(__(?:rt[A-Za-z0-9]+|pluridApi))\b/g)].map((match) => match[1]);
