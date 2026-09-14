// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridPlaneObservation,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * WHICH PLANE DID THE THING I ASKED FOR BECOME?
 *
 * Until this existed the answer was only in the DOM. A host published a route,
 * guessed when the plane would exist (`setTimeout(450)`), then found it with
 * `querySelector('[data-plurid-plane*=…]')` — which returns the FIRST match, so
 * a route open twice addressed the wrong plane. Two products wrote that same
 * workaround independently, which is how a missing API announces itself.
 *
 * A command carrying a `token` is recorded here with the planes that existed
 * WHEN IT WAS PUBLISHED. The next tree the engine produces is diffed against
 * that set: a plane the host asked for is by definition one that was not there
 * before, so the match is exact even when the same route is opened twice.
 */
export interface PendingPlane {
    token: string;
    /** the route asked for, matched loosely (a host publishes a path, the tree holds an absolute route) */
    route: string;
    /** every planeID that existed when the command was published */
    known: Set<string>;
    /** how many tree changes may pass before the request is abandoned */
    remaining: number;
}

/**
 * A request survives a few tree changes before it is dropped.
 *
 * Not a timeout: a wall clock is what made the DOM workaround unreliable in the
 * first place. A plane appears in the tree the layout runs after the command,
 * and the layout may run more than once (a measure, then a settle), so a small
 * number of TREE CHANGES is both generous and bounded. A route that resolves to
 * no registered plane never arrives, and its request must not be kept forever.
 */
export const PENDING_TREE_CHANGES = 4;


/** Every planeID in a tree, roots and children alike. */
export const planeIDsOf = (
    tree: TreePlane[],
): Set<string> => {
    const ids = new Set<string>();

    const walk = (planes: TreePlane[]) => {
        for (const plane of planes || []) {
            if (!plane?.planeID) {
                continue;
            }
            ids.add(plane.planeID);
            walk(plane.children || []);
        }
    };

    walk(tree || []);

    return ids;
};


/** The plane at `planeID`, anywhere in the tree. */
export const planeOf = (
    tree: TreePlane[],
    planeID: string,
): TreePlane | undefined => {
    let found: TreePlane | undefined;

    const walk = (planes: TreePlane[]) => {
        for (const plane of planes || []) {
            if (found) {
                return;
            }
            if (plane?.planeID === planeID) {
                found = plane;
                return;
            }
            walk(plane?.children || []);
        }
    };

    walk(tree || []);

    return found;
};


/**
 * THE PLANE'S IDENTITY IN THE HOST'S OWN VOCABULARY.
 *
 * A route's parameters are parsed by the engine when it builds the plane and
 * were then dropped from every observation, so a product that declares
 * `/thread/:threadID` had to parse `plurid://host/thread/<id>@2` back with a
 * regex to learn the id it had itself supplied. Exported so that regex never
 * needs writing again.
 *
 * They live on the PLANE division, not the path one — `routeDivisions.plane`
 * holds `{ threadID: 'abc' }` for `/thread/:threadID` while
 * `routeDivisions.path` is empty. Both are read, the plane's winning, because
 * a route addressed through a path division carries its own there and a host
 * should not have to know which division its parameters landed in.
 */
export const parametersOf = (
    plane: TreePlane | undefined,
): Record<string, string> => ({
    ...(plane?.routeDivisions?.path?.parameters ?? {}),
    ...(plane?.routeDivisions?.plane?.parameters ?? {}),
});


export const planeParameters = (
    tree: TreePlane[],
    planeID: string,
): Record<string, string> => parametersOf(planeOf(tree, planeID));


/** Does a tree plane's absolute route answer to the (possibly relative) route asked for. */
const answersTo = (
    plane: TreePlane,
    route: string,
) => !route
    || plane.route === route
    || plane.sourceID === route
    || plane.route.endsWith(route);


/**
 * Resolve what can be resolved against a new tree.
 *
 * Returns the observations to publish and the requests still waiting. A request
 * whose patience has run out is dropped rather than carried: a route that
 * resolves to no registered plane never arrives, and a registry that only ever
 * grows is a leak.
 */
export const resolvePending = (
    pending: PendingPlane[],
    tree: TreePlane[],
): {
    observations: PluridPlaneObservation[];
    waiting: PendingPlane[];
} => {
    if (pending.length === 0) {
        return {
            observations: [],
            waiting: [],
        };
    }

    const observations: PluridPlaneObservation[] = [];
    const waiting: PendingPlane[] = [];
    const present = planeIDsOf(tree);

    for (const request of pending) {
        const appeared = [...present]
            .filter((planeID) => !request.known.has(planeID))
            .map((planeID) => planeOf(tree, planeID))
            .filter((plane): plane is TreePlane => !!plane)
            .filter((plane) => answersTo(plane, request.route));

        if (appeared.length > 0) {
            const plane = appeared[0];

            observations.push({
                token: request.token,
                planeID: plane.planeID,
                route: plane.route,
                parameters: parametersOf(plane),
                parentPlaneID: plane.parentPlaneID ?? '',
            });

            continue;
        }

        if (request.remaining > 1) {
            waiting.push({
                ...request,
                remaining: request.remaining - 1,
            });
        }
    }

    return {
        observations,
        waiting,
    };
};
// #endregion module
