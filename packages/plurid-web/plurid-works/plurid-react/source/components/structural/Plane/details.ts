// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridPlaneComponentProperty,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const hasEntries = (
    record: Record<string, string> | undefined,
): boolean => !!record && Object.keys(record).length > 0;


/**
 * What a plane knows about itself: the `plurid` prop's `plane`, and `usePluridPlane()`'s. THE QUERY
 * TRAVELS: the query, the fragment and the parameters are the REQUESTED route's (the tree node's
 * `routeDivisions.plane`, what the link or the view asked for), the registered route's only when the
 * request carried none. The hook read the registered route's, so `/doc/1?tab=x` read `{}` from it
 * and `{ tab: 'x' }` from the prop (2026-10-20).
 */
export const planeDetailsOf = (
    registered: { route: { absolute: string; fragments: PluridPlaneComponentProperty['plane']['fragments']; parameters: Record<string, string>; query: Record<string, string> } },
    node: Pick<TreePlane, 'planeID' | 'parentPlaneID' | 'routeDivisions'>,
): PluridPlaneComponentProperty['plane'] => {
    const requested = node.routeDivisions?.plane;
    const requestedFragments = requested?.fragments;
    const hasFragments = !!requestedFragments
        && ((requestedFragments.elements?.length ?? 0) > 0 || (requestedFragments.texts?.length ?? 0) > 0);
    return {
        value: registered.route.absolute,
        planeID: node.planeID,
        parentPlaneID: node.parentPlaneID,
        fragments: hasFragments ? requestedFragments : registered.route.fragments,
        parameters: hasEntries(requested?.parameters) ? requested!.parameters : registered.route.parameters,
        query: hasEntries(requested?.query) ? requested!.query : registered.route.query,
    };
};
// #endregion module
