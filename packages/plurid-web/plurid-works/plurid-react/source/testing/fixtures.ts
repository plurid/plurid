// #region imports
    // #region libraries
    import {
        general,
    } from '@plurid/plurid-engine';

    import {
        TreePlane,
        TreePlaneLocation,
        RouteDivisions,
        PluridConfiguration,
        PluridPartialConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Fixtures for a host's tests and the engine's own: the data the store holds, built the way the
 * application builds it, so a test never spells a tree node or a configuration by hand.
 */

export interface ViewSize {
    width: number;
    height: number;
}

/** The view every fixture assumes unless told otherwise. */
export const TEST_VIEW: ViewSize = { width: 1000, height: 600 };

const ORIGIN: TreePlaneLocation = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
};

/** The route divisions a tree node carries: the tree never parses them (the engine's tree logic). */
export const emptyRouteDivisions = (
    host = 'localhost',
): RouteDivisions => ({
    protocol: { value: '', secure: false },
    host: { value: host, controlled: true },
    path: { value: '', parameters: {}, query: {} },
    space: { value: '', parameters: {}, query: {} },
    universe: { value: '', parameters: {}, query: {} },
    cluster: { value: '', parameters: {}, query: {} },
    plane: { value: '', parameters: {}, query: {}, fragments: { elements: [], texts: [] } },
    valid: true,
});

export type TreePlaneOverrides =
    & Omit<Partial<TreePlane>, 'location'>
    & { location?: Partial<TreePlaneLocation> };

/** A measured, shown tree node (400 × 300 at the origin): a root, or with `parentPlaneID` a spawned child. */
export const treePlane = (
    planeID: string,
    overrides: TreePlaneOverrides = {},
): TreePlane => {
    const {
        location,
        ...rest
    } = overrides;
    return {
        sourceID: planeID,
        planeID,
        route: '/' + planeID,
        routeDivisions: emptyRouteDivisions(),
        width: 400,
        height: 300,
        show: true,
        ...rest,
        location: { ...ORIGIN, ...location },
    };
};

/** A view-sized sheet: what a page is in the page presentation. */
export const viewSizedSheet = (
    planeID: string,
    overrides: TreePlaneOverrides = {},
    view: ViewSize = TEST_VIEW,
): TreePlane => treePlane(planeID, { width: view.width, height: view.height, ...overrides });

/** A configuration: `partial` layered over the defaults the way the application layers a host's. */
export const configurationWith = (
    partial: PluridPartialConfiguration = {},
): PluridConfiguration => general.configuration.merge(partial);

/** The page presentation's configuration (its three defaults applied), with `partial` on top. */
export const pageConfiguration = (
    partial: PluridPartialConfiguration = {},
): PluridConfiguration => configurationWith({
    ...partial,
    space: {
        presentation: 'page',
        ...partial.space,
    },
});
// #endregion module
