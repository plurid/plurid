/**
 * THE FIXTURE CATALOG: named scenes the harness can open (`?fixture=<name>`), the setup panel
 * lists, the gallery renders, `fixtures.spec.ts` checks for the generic invariants and
 * `visual.spec.ts` snapshots at the named viewpoints. Pure data, erasable TypeScript only: Node
 * imports it for the docs (`pnpm docs.tables` → docs/HARNESS.md).
 */

export interface FixtureViewpoint {
    name: string;
    /** pubsub topics applied in order once the fixture is open and measured; none = the fresh camera */
    apply?: { topic: string; data?: unknown }[];
}

export type FixtureStep =
    | {
        kind: 'clickLink';
        /** the registered route of the plane holding the link */
        plane: string;
        /** the link's target route */
        route: string;
    }
    | {
        kind: 'scroll';
        /** the registered route of the plane whose content scrolls */
        plane: string;
        /** the content's scrollTop, px */
        top: number;
    }
    | {
        kind: 'dock';
        /** the registered route of the plane to dock the camera on (instant; the page presentation) */
        plane: string;
    }
    | {
        kind: 'focus';
        /** the `data-plurid-control` value of the control to focus (its focus ring is the picture) */
        control: string;
    };

export interface FixtureExpectations {
    /** shown planes after the steps */
    planes?: number;
    /** root planes must not overlap in world X/Y (`none`, the default) or overlap by design */
    overlap?: 'none' | 'expected';
    /** every declared size renders as the plane's DOM box (default: when the fixture declares sizes) */
    declaredSizes?: boolean;
    /** every on-screen link is hit by itself at the primary viewpoint (default true) */
    links?: boolean;
    /** the minimap shows one dot per shown plane (default true) */
    minimap?: boolean;
}

export interface FixtureDefinition {
    name: string;
    title: string;
    description: string;
    /** the harness flags (query keys) the fixture sets; explicit params win over these */
    query: Record<string, string>;
    steps?: FixtureStep[];
    /** the viewpoints snapshotted (1–2); the first is the primary one for the invariants */
    viewpoints: FixtureViewpoint[];
    expect?: FixtureExpectations;
}

const FRONT: FixtureViewpoint = { name: 'front' };
const ORBIT: FixtureViewpoint = {
    name: 'orbit',
    apply: [{ topic: 'space.cameraDelta', data: { absolute: { yaw: -30, pitch: 12 }, animate: false } }],
};
/** Every plane fitted in the view. */
const FIT: FixtureViewpoint = { name: 'fit', apply: [{ topic: 'space.fitToView', data: { animate: false } }] };
/** The page presentation's reveal move: the docked page pulled back and tilted. */
const REVEALED: FixtureViewpoint = {
    name: 'revealed',
    apply: [{ topic: 'space.reveal', data: { animate: false } }],
};
/** Revealed, then turned and pulled further back: the pages BEHIND the docked one come into view. */
/** Revealed and turned almost to a spawned page's face: its leash runs BEHIND the site (the child hangs behind it), in the child's own plane, so it shows only from the child's side. */
const LEASH: FixtureViewpoint = {
    name: 'leash',
    apply: [
        { topic: 'space.reveal', data: { animate: false } },
        { topic: 'space.cameraDelta', data: { absolute: { yaw: -80, pitch: 6 }, zoom: { factor: 0.75 }, animate: false } },
    ],
};
const REVEALED_ORBIT: FixtureViewpoint = {
    name: 'revealed-orbit',
    apply: [
        { topic: 'space.reveal', data: { animate: false } },
        { topic: 'space.cameraDelta', data: { absolute: { yaw: -35, pitch: 10 }, zoom: { factor: 0.8 }, animate: false } },
    ],
};

export const FIXTURES: readonly FixtureDefinition[] = [
    { name: 'columns', title: 'Columns', description: 'The five instrument panels in three columns.', query: {}, viewpoints: [FRONT, ORBIT], expect: { planes: 5 } },
    { name: 'rows', title: 'Rows', description: 'The five panels in one row.', query: { layout: 'rows' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5 } },
    { name: 'sheaves', title: 'Sheaves', description: 'A cascade receding into depth (planes overlap by design).', query: { layout: 'sheaves' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5, overlap: 'expected' } },
    { name: 'face-to-face', title: 'Face to face', description: 'Rows whose first and last planes tilt toward each other.', query: { layout: 'faceToFace' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5, overlap: 'expected' } },
    { name: 'zig-zag', title: 'Zig-zag', description: 'One column, alternating tilt.', query: { layout: 'zigZag' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5, overlap: 'expected' } },
    { name: 'columns-mixed-sizes', title: 'Columns, mixed sizes', description: 'Five declared boxes of different widths and heights, packed per column and per row.', query: { sizes: 'mixed' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5, declaredSizes: true } },
    { name: 'rows-mixed-sizes', title: 'Rows, mixed sizes', description: 'The mixed boxes in one row, each column as wide as its plane.', query: { layout: 'rows', sizes: 'mixed' }, viewpoints: [FRONT, ORBIT], expect: { planes: 5, declaredSizes: true } },
    { name: 'zig-zag-tall', title: 'Zig-zag, tall', description: 'Tall declared planes stacked without overlap.', query: { layout: 'zigZag', sizes: 'tall' }, viewpoints: [FRONT], expect: { planes: 5, overlap: 'expected', declaredSizes: true } },
    { name: 'face-to-face-wide', title: 'Face to face, wide', description: 'Wide declared planes; the row spaces by each plane\'s own width.', query: { layout: 'faceToFace', sizes: 'wide' }, viewpoints: [FRONT], expect: { planes: 5, overlap: 'expected', declaredSizes: true } },
    { name: 'columns-small', title: 'Columns, small', description: 'Small declared planes: content scrolls inside a declared height.', query: { sizes: 'small' }, viewpoints: [FRONT], expect: { planes: 5, declaredSizes: true } },
    { name: 'stress-40', title: 'Stress, 40 planes', description: 'Forty generated planes in eight columns.', query: { planes: '40' }, viewpoints: [FRONT], expect: { planes: 40 } },
    { name: 'links-dense', title: 'Dense links', description: 'Six links on GEOMETRY, two to the same route.', query: { links: 'dense' }, viewpoints: [FRONT], expect: { planes: 5 } },
    { name: 'nested-chain-3', title: 'Nested chain', description: 'A three-deep chain spawned from GEOMETRY: each generation turns 90° behind its parent.', query: { nested: '3' }, steps: [{ kind: 'clickLink', plane: '/geometry', route: '/chain-1' }, { kind: 'clickLink', plane: '/chain-1', route: '/chain-2' }, { kind: 'clickLink', plane: '/chain-2', route: '/chain-3' }], viewpoints: [FRONT, ORBIT], expect: { planes: 8, overlap: 'expected', links: false } },
    { name: 'detail-spawned', title: 'Detail spawned', description: 'The DETAIL plane opened from GEOMETRY, behind the wall.', query: {}, steps: [{ kind: 'clickLink', plane: '/geometry', route: '/geometry/detail' }], viewpoints: [FRONT, ORBIT], expect: { planes: 6, overlap: 'expected', links: false } },
    { name: 'media', title: 'Media plane', description: 'A consumer-built media plane beside the panels.', query: { media: '1' }, viewpoints: [FRONT], expect: { planes: 6 } },
    { name: 'page-docked', title: 'A page, docked', description: 'The page presentation: one view-sized page, the camera docked on it, no chrome but the corner control.', query: { presentation: 'page', pages: '1' }, viewpoints: [FRONT], expect: { planes: 1 } },
    { name: 'page-revealed', title: 'A page, revealed', description: 'The same page pulled back and tilted: the sheet in the space behind the site.', query: { presentation: 'page', pages: '1' }, viewpoints: [REVEALED], expect: { planes: 1 } },
    { name: 'page-spawned', title: 'A page, a link followed', description: 'The about page spawned behind the site by its link, the camera docked onto it.', query: { presentation: 'page', pages: '1' }, steps: [{ kind: 'clickLink', plane: '/page-1', route: '/page-1/about' }], viewpoints: [FRONT], expect: { planes: 2, overlap: 'expected', links: false } },
    { name: 'page-spawned-scrolled', title: 'A page scrolled past its link', description: 'The contact page open, the site scrolled so its link is beyond the fold: the child stays, the bridge follows the link to the edge.', query: { presentation: 'page', pages: '1' }, steps: [{ kind: 'clickLink', plane: '/page-1', route: '/page-1/contact' }, { kind: 'dock', plane: '/page-1' }, { kind: 'scroll', plane: '/page-1', top: 600 }], viewpoints: [REVEALED_ORBIT], expect: { planes: 2, overlap: 'expected', links: false } },
    { name: 'page-rail-focus', title: 'A page, the rail focused', description: 'The page presentation with the keyboard on the corner control: its two-tone focus ring reads on the page.', query: { presentation: 'page', pages: '1' }, steps: [{ kind: 'focus', control: 'dock-toggle' }], viewpoints: [FRONT], expect: { planes: 1 } },
    { name: 'page-docked-light', title: 'A light page, docked', description: 'The page presentation on a light site: the rail reads over a light page too.', query: { presentation: 'page', pages: '1', siteTheme: 'light' }, viewpoints: [FRONT], expect: { planes: 1 } },
    { name: 'page-aside', title: 'A page, its sibling aside', description: 'Two pages opened from the site\'s header; docked on the first, the second is set aside (faded, inert).', query: { presentation: 'page', pages: '1' }, steps: [{ kind: 'clickLink', plane: '/page-1', route: '/page-1/about' }, { kind: 'dock', plane: '/page-1' }, { kind: 'clickLink', plane: '/page-1', route: '/page-1/contact' }, { kind: 'dock', plane: '/page-1' }, { kind: 'clickLink', plane: '/page-1', route: '/page-1/about' }], viewpoints: [FRONT, LEASH], expect: { planes: 3, overlap: 'expected', links: false } },
    { name: 'page-leash', title: 'A page, its leash', description: 'The contact page open and the site scrolled past its link, seen from the side: the leash from the link\'s fold to the page.', query: { presentation: 'page', pages: '1' }, steps: [{ kind: 'clickLink', plane: '/page-1', route: '/page-1/contact' }, { kind: 'dock', plane: '/page-1' }, { kind: 'scroll', plane: '/page-1', top: 600 }], viewpoints: [LEASH], expect: { planes: 2, overlap: 'expected', links: false } },
    { name: 'pages-3-revealed', title: 'Three pages, revealed', description: 'Three site pages side by side, fitted in the view.', query: { presentation: 'page', pages: '3' }, viewpoints: [FIT], expect: { planes: 3 } },
    { name: 'columns-paper', title: 'Columns, the paper look', description: 'The five panels under a light look: every piece of chrome on the paper tokens.', query: { look: 'paper' }, viewpoints: [FRONT], expect: { planes: 5 } },
    { name: 'page-revealed-paper', title: 'A page revealed, the paper look', description: 'The revealed page under the paper look: the rail, the toolbar and the cube on light tokens over a dark site.', query: { presentation: 'page', pages: '1', look: 'paper' }, viewpoints: [REVEALED], expect: { planes: 1 } },
    { name: 'columns-headless', title: 'Columns, headless', description: 'No engine chrome at all (`chrome: none`): the planes, their links and the space; every key and topic still works.', query: { chrome: 'none' }, viewpoints: [FRONT], expect: { planes: 5, minimap: false } },
    { name: 'empty', title: 'Empty', description: 'No roots: the empty state.', query: { empty: '1' }, viewpoints: [FRONT], expect: { planes: 0, minimap: false, links: false } },
];

export const fixtureByName = (
    name: string,
): FixtureDefinition | undefined => FIXTURES.find((fixture) => fixture.name === name);

/** The query a scenario opens a fixture with: its name, deterministic motion, and any extras. */
export const fixtureQuery = (
    name: string,
    extra: Record<string, string> = {},
): string => {
    const query = new URLSearchParams({ fixture: name, reducedMotion: '1', momentum: '0', ...extra });
    return '?' + query.toString();
};
