// #region imports
    // #region libraries
    import React, {
        useMemo,
    } from 'react';

    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PlaneLink,
        TreePlane,
        PluridConfiguration,
        ViewSize,

        PLURID_ENTITY_PLANE_LINKS,
        PLURID_ENTITY_PLANE_LEASH,
        BRIDGE_STRIP_HEIGHT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlaneLinks,
        StyledPluridPlaneLink,
        StyledPluridPlaneLeash,
    } from './styled';

    import {
        computeEdgeTransform,
        EdgePoint,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
const THICKNESS = 3;


export interface PluridPlaneLinksStateProperties {
    stateLinks: PlaneLink[];
    stateTree: TreePlane[];
    statePlaneIndex: Map<string, TreePlane>;
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
    stateViewSize: ViewSize;
}

export type PluridPlaneLinksProperties = PluridPlaneLinksStateProperties;


/**
 * The world-space anchor of a plane: its centre, in the shared `StyledPluridRoots` frame, through
 * the plane's rotated basis (`location.translate*` is the top-left corner; a rotated plane's centre
 * is NOT corner + half size along the world axes). Sizes come from the tree (measured by the plane's
 * `ResizeObserver`), with the configured fallback before the first measurement — no DOM reads.
 */
const planeAnchor = (
    plane: TreePlane,
    fallback: { width: number; height: number },
): EdgePoint => interaction.camera.planeCenter({
    location: plane.location,
    width: plane.width || fallback.width,
    height: plane.height || fallback.height,
});


const PluridPlaneLinks: React.FC<PluridPlaneLinksProperties> = (
    properties,
) => {
    // #region properties
    const {
        stateLinks,
        stateTree,
        statePlaneIndex,
        stateGeneralTheme,
        stateConfiguration,
        stateViewSize,
    } = properties;

    const fallbackSize = resolvePlaneFallbackSize(stateConfiguration, stateViewSize);
    // THE LEASH: a child moved by hand keeps its link — its bridge band (a stub off its own edge)
    // would point nowhere, so the beams layer draws the segment from the link's point to the
    // child's edge instead (the Plane skips the band for a `manuallyPositioned` child).
    const leashes = useMemo(() => spaceEngine.tree.fields.collectLeashes(stateTree), [stateTree]);
    // #endregion properties


    // #region render
    if ((!stateLinks || stateLinks.length === 0) && leashes.length === 0) {
        return null;
    }

    const leashBeams = leashes.map(({ parent, child }) => {
        const {
            transform,
            length,
        } = computeEdgeTransform(
            spaceEngine.location.linkWorldPoint(parent.location, child.linkCoordinates!),
            spaceEngine.location.childLeashPoint(child),
            BRIDGE_STRIP_HEIGHT,
        );
        return (
            <StyledPluridPlaneLeash
                key={'leash:' + child.planeID}
                theme={stateGeneralTheme}
                thickness={BRIDGE_STRIP_HEIGHT}
                // the length inline like the transform: both change per drag frame (no class per frame)
                style={{
                    transform,
                    width: length + 'px',
                }}
                data-plurid-entity={PLURID_ENTITY_PLANE_LEASH}
                data-plurid-leash-for={child.planeID}
            />
        );
    });

    const beams = (stateLinks ?? []).map(link => {
        const source = statePlaneIndex.get(link.sourcePlaneID);
        const target = statePlaneIndex.get(link.targetPlaneID);

        // A link to a plane that isn't currently in the tree (closed / not yet spawned) draws
        // nothing — the link survives in state and reappears when both endpoints are present.
        if (!source || !target) {
            return null;
        }
        if (source.show === false || target.show === false) {
            return null;
        }

        const {
            transform,
            length,
        } = computeEdgeTransform(
            planeAnchor(source, fallbackSize),
            planeAnchor(target, fallbackSize),
            THICKNESS,
        );

        return (
            <StyledPluridPlaneLink
                key={link.id}
                theme={stateGeneralTheme}
                length={length}
                thickness={THICKNESS}
                style={{
                    transform,
                }}
                data-plurid-link={link.id}
            />
        );
    });

    return (
        <StyledPluridPlaneLinks
            data-plurid-entity={PLURID_ENTITY_PLANE_LINKS}
        >
            {leashBeams}
            {beams}
        </StyledPluridPlaneLinks>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneLinksStateProperties => ({
    stateLinks: selectors.space.getPlaneLinks(state),
    stateTree: selectors.space.getTree(state),
    statePlaneIndex: selectors.space.getPlaneIndex(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateViewSize: selectors.space.getViewSize(state),
});


// `React.memo` like `PluridRoot`: `<PluridRoots>` re-renders on every orbit frame (it subscribes to
// the transform matrix), but the edges layer's inputs (`links`, the tree, the memoized `planeIndex`,
// theme) are referentially stable across those frames, so `connect` + `memo` bail the re-render. The beams ride
// the camera transform on the parent `StyledPluridRoots` — no per-frame JS.
const ConnectedPluridPlaneLinks = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(React.memo(PluridPlaneLinks));
// #endregion module



// #region exports
export default ConnectedPluridPlaneLinks;
// #endregion exports
