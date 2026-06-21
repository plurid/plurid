// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PlaneLink,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlaneLinks,
        StyledPluridPlaneLink,
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
    statePlaneIndex: Map<string, TreePlane>;
    stateGeneralTheme: Theme;
}

export type PluridPlaneLinksProperties = PluridPlaneLinksStateProperties;


/**
 * The world-space anchor of a plane: its centre, in the shared `StyledPluridRoots` frame.
 *
 * `location.translate*` is the plane's top-left corner; the centre is offset by half its size. The
 * tree node doesn't carry a measured size (its `width`/`height` are 0 under the current layout), so
 * we fall back to the rendered element's box. This runs only when the edges layer re-renders (a link
 * or tree change) — never per orbit frame — so the DOM read is cheap and off the hot path.
 */
const planeAnchor = (
    plane: TreePlane,
): EdgePoint => {
    let width = plane.width;
    let height = plane.height;

    if ((!width || !height) && typeof document !== 'undefined') {
        const element = document.getElementById(plane.planeID);
        if (element) {
            width = width || element.offsetWidth;
            height = height || element.offsetHeight;
        }
    }

    return {
        x: plane.location.translateX + width / 2,
        y: plane.location.translateY + height / 2,
        z: plane.location.translateZ,
    };
}


const PluridPlaneLinks: React.FC<PluridPlaneLinksProperties> = (
    properties,
) => {
    // #region properties
    const {
        stateLinks,
        statePlaneIndex,
        stateGeneralTheme,
    } = properties;
    // #endregion properties


    // #region render
    if (!stateLinks || stateLinks.length === 0) {
        return null;
    }

    const beams = stateLinks.map(link => {
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
            planeAnchor(source),
            planeAnchor(target),
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
        <StyledPluridPlaneLinks>
            {beams}
        </StyledPluridPlaneLinks>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneLinksStateProperties => ({
    stateLinks: selectors.space.getPlaneLinks(state),
    statePlaneIndex: selectors.space.getPlaneIndex(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
});


// `React.memo` like `PluridRoot`: `<PluridRoots>` re-renders on every orbit frame (it subscribes to
// the transform matrix), but the edges layer's inputs (`links`, the memoized `planeIndex`, theme) are
// referentially stable across those frames, so `connect` + `memo` bail the re-render. The beams ride
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
