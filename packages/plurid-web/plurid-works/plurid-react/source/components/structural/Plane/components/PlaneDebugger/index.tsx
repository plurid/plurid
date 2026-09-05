// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        TreePlane,
        CameraState,
        ViewSize,
        PLURID_ENTITY_PLANE_DEBUGGER,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        cameraDepthOf,
        planeWorldCenter,
    } from '~services/logic/selection';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
/** @deprecated Import `PLURID_ENTITY_PLANE_DEBUGGER` from `@plurid/plurid-data`. */
export { PLURID_ENTITY_PLANE_DEBUGGER };


const StyledPluridPlaneDebugger = styled.pre<{ theme: Theme }>`
    position: absolute;
    top: 100%;
    left: 0;
    margin: 2px 0 0;
    padding: 4px 6px;
    font: 10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: ${({ theme }) => theme.colorPrimary};
    background-color: ${({ theme }) => theme.backgroundColorPrimaryAlpha};
    border: 1px solid ${({ theme }) => theme.backgroundColorTertiary};
    border-radius: 4px;
    pointer-events: none;
    user-select: none;
    white-space: pre;
`;


export interface PluridPlaneDebuggerOwnProperties {
    treePlane: TreePlane;
}

export interface PluridPlaneDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateCamera: CameraState;
    stateViewSize: ViewSize;
    stateFallback: { width: number; height: number };
    stateCulled: 'visible' | 'hidden' | 'frozen';
}

export type PluridPlaneDebuggerProperties =
    & PluridPlaneDebuggerOwnProperties
    & PluridPlaneDebuggerStateProperties;


/** Per-plane readout (`development.planeDebugger`): id, route, placement, size, depth, link. */
const PluridPlaneDebugger: React.FC<PluridPlaneDebuggerProperties> = (
    {
        treePlane,
        stateGeneralTheme,
        stateCamera,
        stateViewSize,
        stateFallback,
        stateCulled,
    },
) => {
    const depth = cameraDepthOf(stateCamera, stateViewSize, planeWorldCenter(treePlane, stateFallback));
    const location = treePlane.location;
    const lines = [
        `${treePlane.planeID}`,
        `${treePlane.route}`,
        `at ${Math.round(location.translateX)},${Math.round(location.translateY)},${Math.round(location.translateZ)}  rot ${Math.round(location.rotateX)},${Math.round(location.rotateY)}`,
        `size ${Math.round(treePlane.width)}×${Math.round(treePlane.height)} ${treePlane.sizeMode || 'measured'}  depth ${Math.round(stateCamera.perspective - depth)}  ${stateCulled}`,
        treePlane.spawnedByLinkID ? `link ${treePlane.spawnedByLinkID}` : 'root',
    ];

    return (
        <StyledPluridPlaneDebugger
            theme={stateGeneralTheme}
            data-plurid-entity={PLURID_ENTITY_PLANE_DEBUGGER}
            aria-hidden="true"
        >
            {lines.join('\n')}
        </StyledPluridPlaneDebugger>
    );
};


const mapStateToProperties = (
    state: AppState,
    ownProperties: PluridPlaneDebuggerOwnProperties,
): PluridPlaneDebuggerStateProperties => {
    const culled = state.space.culled;
    const id = ownProperties.treePlane.planeID;
    return {
        stateGeneralTheme: selectors.themes.getGeneralTheme(state),
        stateCamera: state.space.camera,
        stateViewSize: state.space.viewSize,
        stateFallback: resolvePlaneFallbackSize(state.configuration, state.space.viewSize),
        stateCulled: culled?.hidden.includes(id) ? 'hidden' : (culled?.frozen.includes(id) ? 'frozen' : 'visible'),
    };
};


const ConnectedPluridPlaneDebugger = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneDebugger);
// #endregion module



// #region exports
export default ConnectedPluridPlaneDebugger;
// #endregion exports
