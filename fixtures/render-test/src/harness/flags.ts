/**
 * THE FLAG REGISTRY of the harness. Every `?flag=` the harness understands is declared here once —
 * key, type, default, how it applies (live / remount / reload), what it exercises — and everything
 * else reads it: `readFlags` (the URL → typed flags), the setup panel (its controls), the docs
 * generator (`pnpm docs.tables` → docs/HARNESS.md) and the fixture catalog (a fixture is a set of
 * flags). Erasable TypeScript only (no enums): Node imports this file directly for the docs.
 */

export type FlagGroup =
    | 'scene'
    | 'layout'
    | 'planes'
    | 'navigation'
    | 'gestures'
    | 'input'
    | 'rendering'
    | 'selection'
    | 'shortcuts'
    | 'ui'
    | 'persistence'
    | 'document'
    | 'links'
    | 'debug';

export type FlagApply =
    /** switches on the mounted application (the configuration prop) */
    | 'live'
    /** re-creates the application (a new key), no page load */
    | 'remount'
    /** a page load (a startup-only option) */
    | 'reload';

export interface FlagDefinition {
    /** the query key */
    key: string;
    /** the typed field name in `HarnessFlags` (defaults to `key`) */
    name?: string;
    type: 'boolean' | 'number' | 'string' | 'enum';
    /** enum values */
    values?: readonly string[];
    /** the value that means "on" for a boolean — `'0'` for the three inverted flags */
    on?: '1' | '0';
    default?: string | number | boolean;
    group: FlagGroup;
    /** what it does in the harness */
    description: string;
    /** the engine knob / seam it exercises */
    exercises: string;
    apply: FlagApply;
}

export const LAYOUT_KEYS = ['columns', 'rows', 'sheaves', 'faceToFace', 'zigZag'] as const;
export type LayoutKey = typeof LAYOUT_KEYS[number];

export const SIZE_SET_KEYS = ['default', 'mixed', 'wide', 'tall', 'small'] as const;
export type SizeSetKey = typeof SIZE_SET_KEYS[number];

export const FLAGS: readonly FlagDefinition[] = [
    // scene
    { key: 'fixture', type: 'string', group: 'scene', apply: 'reload', description: 'open a named fixture from the catalog (its flags apply UNDER any explicit param)', exercises: 'the fixture catalog (src/fixtures/catalog.ts)' },
    { key: 'viewpoint', type: 'string', group: 'scene', apply: 'reload', description: 'an encoded viewpoint applied once the planes are measured', exercises: '`space.setViewpoint`' },
    { key: 'gallery', type: 'boolean', group: 'scene', apply: 'reload', description: 'the contact sheet: every fixture in an iframe', exercises: 'the fixture catalog' },
    { key: 'router', type: 'boolean', group: 'scene', apply: 'reload', description: 'the router demo instead of the space (PluridRouterBrowser)', exercises: 'PluridRouterBrowser / PluridRouterLink' },
    { key: 'empty', type: 'boolean', group: 'scene', apply: 'reload', description: 'an empty view (no roots)', exercises: 'the empty state' },
    // layout
    { key: 'layout', type: 'enum', values: LAYOUT_KEYS, default: 'columns', group: 'layout', apply: 'live', description: 'the root layout', exercises: '`space.layout` (an animated relayout on the live instance)' },
    // planes
    { key: 'planes', type: 'number', group: 'planes', apply: 'remount', description: 'N generated planes instead of the five instrument panels (stress)', exercises: 'many roots; the 8-column stress layout' },
    { key: 'sizes', type: 'enum', values: SIZE_SET_KEYS, default: 'default', group: 'planes', apply: 'remount', description: 'declared plane sizes: mixed (five different boxes), wide, tall, small', exercises: '`planes[].width` / `height` (declared sizes), per-column / per-row layout pitch' },
    { key: 'media', type: 'boolean', group: 'planes', apply: 'reload', description: 'a consumer-style media plane (lens, lazy image, button-driven video)', exercises: '`usePluridPlane()` from content; window.__rtPlaneLens' },
    { key: 'scrollable', type: 'boolean', group: 'planes', apply: 'reload', description: 'the GEOMETRY readout is a scroller (28 filler rows in a 120px box)', exercises: 'the wheel over scrollable content stays the content\'s' },
    // links
    { key: 'links', type: 'enum', values: ['dense'], group: 'links', apply: 'reload', description: 'six links on the GEOMETRY plane, two to the same route', exercises: 'link ordinals, distinct children' },
    { key: 'nested', type: 'number', group: 'links', apply: 'reload', description: 'a chain of N planes each linking to the next; GEOMETRY links to the first', exercises: 'the spawn fan (90° every generation), bridges' },
    // document
    { key: 'document', type: 'boolean', group: 'document', apply: 'reload', description: 'the document model: GEOMETRY declares a title / description / lang / JSON-LD, DETAIL a title through children + a `planes[].head`', exercises: '`usePluridDocument`, `<PluridDocument>`, `planes[].head`' },
    // navigation
    { key: 'reducedMotion', type: 'boolean', group: 'navigation', apply: 'reload', description: 'every tween / fling / relayout instant', exercises: '`navigation.motion.duration: 0`' },
    { key: 'motionMs', type: 'number', group: 'navigation', apply: 'reload', description: 'the tween duration (ignored with reducedMotion)', exercises: '`navigation.motion.duration`' },
    { key: 'home', type: 'string', group: 'navigation', apply: 'reload', description: 'the home viewpoint (v1 `rX,rY,tX,tY,tZ,s` or v2)', exercises: '`navigation.home`' },
    { key: 'presets', type: 'boolean', group: 'navigation', apply: 'reload', description: 'three named viewpoints: front, side, top', exercises: '`navigation.presets`, the `space.preset` topic' },
    { key: 'pivot', type: 'enum', values: ['view', 'selection', 'cursor'], group: 'navigation', apply: 'reload', description: 'what an orbit turns about', exercises: '`navigation.orbitPivot`' },
    { key: 'pitchLimit', type: 'number', group: 'navigation', apply: 'reload', description: 'the orbit never flips past this pitch', exercises: '`navigation.pitchLimit`' },
    { key: 'perspective', type: 'number', group: 'navigation', apply: 'reload', description: 'the CSS lens', exercises: '`space.perspective`' },
    { key: 'vp', type: 'enum', values: ['2'], group: 'navigation', apply: 'reload', description: 'full-camera (v2) viewpoints in the URL and the callback', exercises: '`viewpointURLVersion: 2`' },
    // gestures
    { key: 'momentum', name: 'momentumOff', type: 'boolean', on: '0', group: 'gestures', apply: 'reload', description: 'no fling after a drag (release stops dead)', exercises: '`gestures.disableMomentum`' },
    { key: 'rotateSens', type: 'number', group: 'gestures', apply: 'reload', description: 'orbit degrees per pixel of drag', exercises: '`gestures.rotateSensitivity`' },
    { key: 'dragThreshold', type: 'number', group: 'gestures', apply: 'reload', description: 'pixels a press travels before it is a drag (0 allowed)', exercises: '`gestures.dragThreshold`' },
    { key: 'btnLeft', type: 'enum', values: ['orbit', 'pan', 'zoom', 'disabled'], group: 'gestures', apply: 'reload', description: 'what the left button does', exercises: '`gestures.buttonMap.left`' },
    { key: 'btnRight', type: 'enum', values: ['orbit', 'pan', 'zoom', 'dolly', 'disabled', 'menu'], group: 'gestures', apply: 'reload', description: 'what the right button does', exercises: '`gestures.buttonMap.right`' },
    { key: 'btnWheel', type: 'enum', values: ['zoom', 'disabled'], group: 'gestures', apply: 'reload', description: 'whether the wheel zooms', exercises: '`gestures.buttonMap.wheel`' },
    { key: 'touchOne', type: 'enum', values: ['orbit', 'pan', 'disabled'], group: 'gestures', apply: 'reload', description: 'one finger on empty space', exercises: '`gestures.touchOne`' },
    { key: 'trackpad', type: 'enum', values: ['pan', 'zoom', 'orbit', 'disabled'], group: 'gestures', apply: 'reload', description: 'a two-finger trackpad scroll on empty space', exercises: '`gestures.trackpadScroll`' },
    { key: 'wheel', type: 'enum', values: ['zoom', 'scroll-first', 'disabled'], group: 'gestures', apply: 'reload', description: 'the mouse-wheel policy', exercises: '`gestures.wheel`' },
    { key: 'dblclick', name: 'doubleClickOff', type: 'boolean', on: '0', group: 'gestures', apply: 'reload', description: 'a double-click never frames', exercises: '`gestures.doubleClickFrame: false`' },
    { key: 'gamepad', type: 'boolean', group: 'gestures', apply: 'reload', description: 'a gamepad stick orbits (tests stub navigator.getGamepads)', exercises: '`gestures.gamepad.enabled`' },
    // selection
    { key: 'resizable', type: 'boolean', group: 'selection', apply: 'reload', description: 'resize handles on a selected plane', exercises: '`elements.plane.resizable`, `setPlaneSize({ sizeMode: manual })`' },
    { key: 'snapGrid', type: 'number', group: 'selection', apply: 'reload', description: 'a snap grid for drag-to-move', exercises: '`space.snap`' },
    // rendering
    { key: 'culling', type: 'boolean', group: 'rendering', apply: 'reload', description: 'frustum / distance culling', exercises: '`space.culling.enabled`' },
    { key: 'cullDistance', type: 'number', group: 'rendering', apply: 'reload', description: 'the culling distance', exercises: '`space.culling.distance`' },
    { key: 'freezeDistance', type: 'number', group: 'rendering', apply: 'reload', description: 'the freeze distance', exercises: '`space.culling.freezeDistance`' },
    { key: 'depthFade', type: 'boolean', group: 'rendering', apply: 'reload', description: 'far planes fade and blur', exercises: '`elements.plane.depthFade`' },
    { key: 'spaceW', type: 'number', group: 'rendering', apply: 'reload', description: 'the roots container width', exercises: '`space.dimensions.width`' },
    { key: 'spaceH', type: 'number', group: 'rendering', apply: 'reload', description: 'the roots container height', exercises: '`space.dimensions.height`' },
    { key: 'bench', type: 'boolean', group: 'rendering', apply: 'reload', description: 'a scripted orbit + pan + zoom over 240 frames → window.__rtBench', exercises: 'the per-frame camera path (bench.spec.ts)' },
    // ui
    { key: 'hostileCss', type: 'boolean', group: 'ui', apply: 'reload', description: 'a host stylesheet with aggressive global resets', exercises: 'the chrome reset (chrome.spec.ts)' },
    { key: 'slotToolbar', type: 'boolean', group: 'ui', apply: 'reload', description: 'a custom toolbar through the render slot', exercises: '`renderToolbar`' },
    { key: 'hideLinks', type: 'boolean', group: 'ui', apply: 'reload', description: 'hide the link beams and the alignment guides', exercises: '`elements.planeLinks.show`, `elements.alignmentGuides.show`' },
    { key: 'debug', type: 'boolean', group: 'debug', apply: 'reload', description: 'the space and plane debuggers (the perf HUD)', exercises: '`development.spaceDebugger` / `planeDebugger`' },
    // shortcuts
    { key: 'scDisable', type: 'string', group: 'shortcuts', apply: 'reload', description: '`all` or a comma list of shortcut ids to disable', exercises: '`shortcuts.disabled`' },
    { key: 'scRemap', type: 'string', group: 'shortcuts', apply: 'reload', description: '`id:Code` pairs, comma separated', exercises: '`shortcuts.keymap`' },
    // persistence
    { key: 'persist', type: 'boolean', group: 'persistence', apply: 'remount', description: 'persist the space to localStorage; a reload restores it', exercises: '`useLocalStorage`, `onPersistContent` / `onRestoreContent`' },
    { key: 'store', type: 'enum', values: ['memory'], group: 'persistence', apply: 'reload', description: 'persist to an in-memory adapter (window.__rtStore) instead of localStorage', exercises: '`storageAdapter`' },
    { key: 'persistMs', type: 'number', group: 'persistence', apply: 'reload', description: 'the persistence debounce', exercises: '`timings.persistDebounce`' },
    { key: 'undo', name: 'undoOff', type: 'boolean', on: '0', group: 'persistence', apply: 'reload', description: 'no history middleware', exercises: '`space.undo: false`' },
];

/** The typed flags: one field per registry entry (`name` or `key`); absent = its default. */
export interface HarnessFlags {
    fixture?: string;
    viewpoint?: string;
    gallery: boolean;
    router: boolean;
    empty: boolean;
    layout: LayoutKey;
    planes?: number;
    sizes: SizeSetKey;
    media: boolean;
    scrollable: boolean;
    links?: 'dense';
    nested?: number;
    document: boolean;
    reducedMotion: boolean;
    motionMs?: number;
    home?: string;
    presets: boolean;
    pivot?: 'view' | 'selection' | 'cursor';
    pitchLimit?: number;
    perspective?: number;
    vp?: '2';
    momentumOff: boolean;
    rotateSens?: number;
    dragThreshold?: number;
    btnLeft?: 'orbit' | 'pan' | 'zoom' | 'disabled';
    btnRight?: 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled' | 'menu';
    btnWheel?: 'zoom' | 'disabled';
    touchOne?: 'orbit' | 'pan' | 'disabled';
    trackpad?: 'pan' | 'zoom' | 'orbit' | 'disabled';
    wheel?: 'zoom' | 'scroll-first' | 'disabled';
    doubleClickOff: boolean;
    gamepad: boolean;
    resizable: boolean;
    snapGrid?: number;
    culling: boolean;
    cullDistance?: number;
    freezeDistance?: number;
    depthFade: boolean;
    spaceW?: number;
    spaceH?: number;
    bench: boolean;
    hostileCss: boolean;
    slotToolbar: boolean;
    hideLinks: boolean;
    debug: boolean;
    scDisable?: string;
    scRemap?: string;
    persist: boolean;
    store?: 'memory';
    persistMs?: number;
    undoOff: boolean;
}

export const flagField = (flag: FlagDefinition): keyof HarnessFlags => (flag.name ?? flag.key) as keyof HarnessFlags;

/** Parse one raw query value by its definition; `undefined` when absent or invalid. */
const parseFlag = (flag: FlagDefinition, raw: string | null): unknown => {
    if (raw === null) {
        return flag.type === 'boolean' ? false : flag.default;
    }
    switch (flag.type) {
        case 'boolean':
            return raw === (flag.on ?? '1');
        case 'number': {
            const value = Number(raw);
            return Number.isFinite(value) ? value : flag.default;
        }
        case 'enum':
            return flag.values && flag.values.includes(raw) ? raw : flag.default;
        default:
            return raw || flag.default;
    }
};

/** A fixture's own flags, resolved by the catalog; injected to keep this module import-free. */
export type FixtureQueryResolver = (name: string) => Record<string, string> | undefined;

/**
 * The URL → typed flags. A `?fixture=<name>` expands into the fixture's query UNDER the explicit
 * params, so a test (or a person) can open a fixture and still override one of its flags.
 */
export const readFlags = (
    search: string,
    resolveFixture?: FixtureQueryResolver,
): HarnessFlags => {
    const explicit = new URLSearchParams(search);
    const merged = new URLSearchParams();
    const fixtureName = explicit.get('fixture');
    const fixtureQuery = fixtureName && resolveFixture ? resolveFixture(fixtureName) : undefined;
    if (fixtureQuery) {
        for (const [key, value] of Object.entries(fixtureQuery)) {
            merged.set(key, value);
        }
    }
    for (const [key, value] of explicit) {
        merged.set(key, value);
    }
    const flags: Record<string, unknown> = {};
    for (const flag of FLAGS) {
        flags[flagField(flag)] = parseFlag(flag, merged.get(flag.key));
    }
    return flags as unknown as HarnessFlags;
};

/** Typed flags → the query string (defaults and "off" omitted; `?` included, empty when nothing is set). */
export const buildQuery = (
    flags: Partial<HarnessFlags>,
): string => {
    const query = new URLSearchParams();
    for (const flag of FLAGS) {
        const value = flags[flagField(flag)];
        if (value === undefined || value === null || value === '') {
            continue;
        }
        if (flag.type === 'boolean') {
            if (value === true) {
                query.set(flag.key, flag.on ?? '1');
            }
            continue;
        }
        if (value === flag.default) {
            continue;
        }
        query.set(flag.key, String(value));
    }
    const text = query.toString();
    return text ? '?' + text : '';
};

/** The flags grouped for the panel and the docs, in registry order. */
export const flagsByGroup = (): Map<FlagGroup, FlagDefinition[]> => {
    const groups = new Map<FlagGroup, FlagDefinition[]>();
    for (const flag of FLAGS) {
        const list = groups.get(flag.group) ?? [];
        list.push(flag);
        groups.set(flag.group, list);
    }
    return groups;
};
