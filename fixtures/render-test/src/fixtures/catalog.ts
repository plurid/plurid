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

export interface FixtureStep {
    kind: 'clickLink';
    /** the registered route of the plane holding the link */
    plane: string;
    /** the link's target route */
    route: string;
}

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
