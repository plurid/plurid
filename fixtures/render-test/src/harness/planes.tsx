import React from 'react';
import {
    PluridReactPlane,
    PluridDocument,
    usePluridDocument,
} from '@plurid/plurid-react';

import Panel, { PanelProps } from '../Plane';
import MediaPlane from '../MediaPlane';
import {
    SitePage,
    SubPage,
    SiteOptions,
} from '../Site';
import type { HarnessFlags, SizeSetKey } from './flags';


/** A declared plane size (px). */
export interface DeclaredSize {
    width?: number;
    height?: number;
}

/** The five CAD instrument panels — enough planes to exercise layout + 3D transforms. */
export const PANELS: (PanelProps & { route: string })[] = [
    {
        route: '/geometry', title: 'GEOMETRY', code: 'G-01', accent: '#4da3ff',
        rows: [['vertices', '2 048'], ['faces', '4 092'], ['manifold', 'true'], ['bbox', '120×80×40']],
    },
    {
        route: '/transform', title: 'TRANSFORM', code: 'T-02', accent: '#ffb454',
        rows: [['rotateX', '0.00°'], ['rotateY', '0.00°'], ['scale', '1.000'], ['origin', 'center']],
    },
    {
        route: '/material', title: 'MATERIAL', code: 'M-03', accent: '#7ee787',
        rows: [['shader', 'pbr/standard'], ['roughness', '0.40'], ['metallic', '0.10'], ['ior', '1.450']],
    },
    {
        route: '/topology', title: 'TOPOLOGY', code: 'P-04', accent: '#d2a8ff',
        rows: [['genus', '0'], ['euler', '2'], ['boundary', 'closed'], ['watertight', 'true']],
    },
    {
        route: '/tessellation', title: 'TESSELLATION', code: 'S-05', accent: '#ff7b72',
        rows: [['method', 'delaunay'], ['max edge', '1.20'], ['triangles', '8 184'], ['quality', '0.92']],
    },
];

const STRESS_ACCENTS = ['#4da3ff', '#ffb454', '#7ee787', '#d2a8ff', '#ff7b72'];

/** N generated panels (the stress set). */
export const stressPanels = (
    count: number,
): (PanelProps & { route: string })[] => Array.from({ length: Math.max(1, count) }, (_, i) => ({
    route: `/plane-${i + 1}`,
    title: `PLANE · ${String(i + 1).padStart(2, '0')}`,
    code: `X-${String(i + 1).padStart(2, '0')}`,
    accent: STRESS_ACCENTS[i % STRESS_ACCENTS.length],
    rows: [['index', `${i + 1}`], ['column', `${(i % 8) + 1}`], ['row', `${Math.floor(i / 8) + 1}`], ['status', 'ok']],
}));

/**
 * The declared-size sets: what a root plane declares by its position in the set. `default` declares
 * nothing (the configured width, content-driven height); the others give every plane its own box.
 */
export const SIZE_SETS: Record<SizeSetKey, (index: number) => DeclaredSize | undefined> = {
    default: () => undefined,
    mixed: (index) => [
        { width: 480, height: 300 },
        { width: 320, height: 420 },
        { width: 560, height: 260 },
        { width: 400, height: 400 },
        { width: 360, height: 340 },
    ][index % 5],
    wide: () => ({ width: 640, height: 300 }),
    tall: () => ({ width: 320, height: 560 }),
    small: () => ({ width: 260, height: 200 }),
};

export const DETAIL_ROUTE = '/geometry/detail';

/** `?document=1`: the GEOMETRY plane's document layer (a hook in a plane component). */
const GeometryDocument = () => {
    usePluridDocument({
        title: 'GEOMETRY · rt',
        titleTemplate: '%s · plurid',
        description: 'geometry from the plane',
        lang: 'en-rt',
        jsonLd: [{ '@type': 'Thing', name: 'geometry' }],
    });
    return null;
};

/**
 * The SITE set (`?pages=N`): N root pages, each linking to an about (long) and a contact (short)
 * sub-page registered but not in view — what a consumer site looks like in the page presentation.
 */
export const buildSite = (
    count: number,
    options: SiteOptions = {},
): BuiltPlanes => {
    const indices = Array.from({ length: Math.max(1, count) }, (_, i) => i + 1);
    const roots: PluridReactPlane[] = indices.map((index) => ({
        route: `/page-${index}`,
        component: () => <SitePage index={index} options={options} />,
    }));
    const subPages: PluridReactPlane[] = indices.flatMap((index) => [
        { route: `/page-${index}/about`, component: () => <SubPage index={index} kind="about" options={options} /> },
        { route: `/page-${index}/contact`, component: () => <SubPage index={index} kind="contact" options={options} /> },
    ]);
    return {
        planes: [...roots, ...subPages],
        view: roots.map((root) => (root as { route: string }).route),
        declared: {},
    };
};

export interface BuiltPlanes {
    planes: PluridReactPlane[];
    /** the initially visible roots */
    view: string[];
    /** the declared sizes by route (for the `__rtPlanes()` assertion global) */
    declared: Record<string, DeclaredSize>;
}

/** The planes and the initial view for a set of flags. */
export const buildPlanes = (
    flags: HarnessFlags,
): BuiltPlanes => {
    if (flags.pages) {
        return buildSite(flags.pages, { theme: flags.siteTheme ?? 'dark', stickyHeader: flags.stickyHeader });
    }
    const stress = !!flags.planes;
    const source = stress ? stressPanels(flags.planes ?? 40) : PANELS;
    const sizeOf = SIZE_SETS[flags.sizes] ?? SIZE_SETS.default;
    const declared: Record<string, DeclaredSize> = {};

    const geometryLinks = [
        ...(flags.links === 'dense' ? [
            { route: '/material', label: 'material' },
            { route: '/topology', label: 'topology' },
            { route: DETAIL_ROUTE, label: 'detail again' },
            { route: '/tessellation', label: 'tessellation' },
            { route: '/transform', label: 'transform' },
        ] : []),
        ...((flags.nested ?? 0) > 0 ? [{ route: '/chain-1', label: 'chain' }] : []),
    ];

    const roots: PluridReactPlane[] = source.map((panel, index) => {
        const size = sizeOf(index);
        if (size) {
            declared[panel.route] = size;
        }
        return {
            route: panel.route,
            component: () => (
                <>
                    {flags.document && panel.route === '/geometry' && <GeometryDocument />}
                    <Panel
                        title={panel.title}
                        code={panel.code}
                        accent={panel.accent}
                        rows={panel.rows}
                        link={panel.route === '/geometry' ? { route: DETAIL_ROUTE, label: 'open detail' } : undefined}
                        links={panel.route === '/geometry' ? geometryLinks : undefined}
                        scrollable={flags.scrollable && panel.route === '/geometry'}
                        fill={!!size?.height}
                    />
                </>
            ),
            ...(size ?? {}),
        };
    });

    // A plane registered but NOT in the initial `view` — a plurid link spawns it into the space
    // (joined to its parent by a bridge). Links in links in links: the DETAIL plane links to three
    // sub-planes, each of which links further, and the leaves link back to an already-shown root.
    const detailPlane: PluridReactPlane = {
        route: DETAIL_ROUTE,
        component: () => (
            <>
                {flags.document && (
                    <PluridDocument>
                        <title>DETAIL · rt</title>
                        <meta name="robots" content="noindex" />
                    </PluridDocument>
                )}
                <Panel
                    title="GEOMETRY · DETAIL"
                    code="G-01·D"
                    accent="#4da3ff"
                    rows={[['edges', '6 140'], ['normals', 'per-vertex'], ['uv sets', '2'], ['lod', '3']]}
                    links={[
                        { route: DETAIL_ROUTE + '/mesh', label: 'mesh' },
                        { route: DETAIL_ROUTE + '/uv', label: 'uv' },
                        { route: DETAIL_ROUTE + '/lod', label: 'lod' },
                    ]}
                />
            </>
        ),
        ...(flags.document ? { head: { meta: [{ name: 'generator', content: 'detail planes[].head' }] } } : {}),
    };
    const nestedDetailPlanes: PluridReactPlane[] = [
        { route: DETAIL_ROUTE + '/mesh', title: 'DETAIL · MESH', code: 'G-01·D·M', rows: [['triangles', '4 092'], ['quads', '0'], ['ngons', '0']], links: [{ route: DETAIL_ROUTE + '/mesh/edges', label: 'edges' }, { route: DETAIL_ROUTE + '/mesh/normals', label: 'normals' }] },
        { route: DETAIL_ROUTE + '/uv', title: 'DETAIL · UV', code: 'G-01·D·U', rows: [['sets', '2'], ['islands', '37'], ['overlap', 'none']], links: [{ route: DETAIL_ROUTE + '/uv/atlas', label: 'atlas' }] },
        { route: DETAIL_ROUTE + '/lod', title: 'DETAIL · LOD', code: 'G-01·D·L', rows: [['levels', '3'], ['ratio', '0.5'], ['screen', '12 px']], links: [{ route: DETAIL_ROUTE + '/lod/levels', label: 'levels' }] },
        { route: DETAIL_ROUTE + '/mesh/edges', title: 'MESH · EDGES', code: 'G-01·D·M·E', rows: [['count', '6 140'], ['boundary', '0'], ['hard', '412']], links: [{ route: '/material', label: 'material' }] },
        { route: DETAIL_ROUTE + '/mesh/normals', title: 'MESH · NORMALS', code: 'G-01·D·M·N', rows: [['mode', 'per-vertex'], ['smoothing', '60°']], links: [{ route: '/material', label: 'material' }] },
        { route: DETAIL_ROUTE + '/uv/atlas', title: 'UV · ATLAS', code: 'G-01·D·U·A', rows: [['size', '4096²'], ['padding', '4 px']], links: [{ route: '/material', label: 'material' }] },
        { route: DETAIL_ROUTE + '/lod/levels', title: 'LOD · LEVELS', code: 'G-01·D·L·L', rows: [['lod0', '4 092'], ['lod1', '2 046'], ['lod2', '1 023']], links: [{ route: '/material', label: 'material' }] },
    ].map(({ route, title, code, rows, links }) => ({
        route,
        component: () => (
            <Panel
                title={title}
                code={code}
                accent="#4da3ff"
                rows={rows as [string, string][]}
                links={links}
            />
        ),
    }));

    const nested = flags.nested ?? 0;
    const chainPlanes: PluridReactPlane[] = Array.from({ length: nested }, (_, i) => {
        const index = i + 1;
        return {
            route: `/chain-${index}`,
            component: () => (
                <Panel
                    title={`CHAIN · ${index}`}
                    code={`C-${String(index).padStart(2, '0')}`}
                    accent="#ffb454"
                    rows={[['depth', `${index}`], ['next', index < nested ? `/chain-${index + 1}` : 'none']]}
                    link={index < nested ? { route: `/chain-${index + 1}`, label: 'next' } : undefined}
                />
            ),
        };
    });

    const planes: PluridReactPlane[] = [
        ...roots,
        detailPlane,
        ...nestedDetailPlanes,
        ...chainPlanes,
        ...(flags.media ? [{ route: '/media', component: MediaPlane }] : []),
    ];
    const view = flags.empty
        ? []
        : [
            ...source.map((panel) => panel.route),
            ...(flags.media ? ['/media'] : []),
        ];

    return { planes, view, declared };
};
