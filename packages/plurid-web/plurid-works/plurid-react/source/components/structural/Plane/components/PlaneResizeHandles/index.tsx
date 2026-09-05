// #region imports
    // #region libraries
    import React, {
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {

        chromeRoot,

    } from '~services/styled/chrome';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PLURID_ENTITY_PLANE_RESIZE_HANDLE,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    // #endregion external
// #endregion imports



// #region module
/** @deprecated Import `PLURID_ENTITY_PLANE_RESIZE_HANDLE` from `@plurid/plurid-data`. */
export { PLURID_ENTITY_PLANE_RESIZE_HANDLE };

const MIN_WIDTH = 120;
const MIN_HEIGHT = 80;
const HANDLE = 12;


const StyledHandle = styled.div<{ theme: Theme; kind: 'right' | 'bottom' | 'corner' }>`
    ${chromeRoot}
    position: absolute;
    z-index: ${Z_INDEX.PLANE_CHROME};
    touch-action: none;
    ${({ kind }) => {
        switch (kind) {
            case 'right':
                return `right: -${HANDLE / 2}px; top: 0; bottom: ${HANDLE}px; width: ${HANDLE}px; cursor: ew-resize;`;
            case 'bottom':
                return `bottom: -${HANDLE / 2}px; left: 0; right: ${HANDLE}px; height: ${HANDLE}px; cursor: ns-resize;`;
            default:
                return `right: -${HANDLE / 2}px; bottom: -${HANDLE / 2}px; width: ${HANDLE}px; height: ${HANDLE}px; cursor: nwse-resize;`;
        }
    }}

    &::after {
        content: '';
        position: absolute;
        inset: 3px;
        border-radius: 2px;
        background-color: ${({ theme }) => theme.colorPrimary};
        opacity: ${({ kind }) => (kind === 'corner' ? 0.9 : 0)};
    }

    &:hover::after {
        opacity: 0.9;
    }
`;


export interface PluridPlaneResizeHandlesOwnProperties {
    planeID: string;
    width: number;
    height: number;
}

export interface PluridPlaneResizeHandlesStateProperties {
    stateInteractionTheme: Theme;
    stateScale: number;
}

export interface PluridPlaneResizeHandlesDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
}

export type PluridPlaneResizeHandlesProperties =
    & PluridPlaneResizeHandlesOwnProperties
    & PluridPlaneResizeHandlesStateProperties
    & PluridPlaneResizeHandlesDispatchProperties;


/**
 * Resize handles on a selected plane (`elements.plane.resizable`): the right edge, the bottom edge
 * and the corner. A drag writes `setPlaneSize({ sizeMode: 'manual' })` so the plane keeps the size
 * (its `ResizeObserver` stops reporting) and its spawned children reflow with it; one history entry
 * per drag. The handles are engine controls, so the gesture layer never turns the press into a move.
 */
const PluridPlaneResizeHandles: React.FC<PluridPlaneResizeHandlesProperties> = (
    {
        planeID,
        width,
        height,
        stateInteractionTheme,
        stateScale,
        dispatch,
    },
) => {
    const drag = useRef<{
        kind: 'right' | 'bottom' | 'corner';
        pointerId: number;
        startX: number;
        startY: number;
        width: number;
        height: number;
    } | null>(null);

    const onPointerDown = (kind: 'right' | 'bottom' | 'corner') => (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            kind,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            width,
            height,
        };
        dispatch(actions.space.historyBegin());
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        // Screen px → plane px through the zoom (exact for a face-on plane).
        const scale = stateScale || 1;
        const dx = (event.clientX - current.startX) / scale;
        const dy = (event.clientY - current.startY) / scale;
        const nextWidth = current.kind === 'bottom'
            ? current.width
            : Math.max(MIN_WIDTH, Math.round((current.width + dx) * 2) / 2);
        const nextHeight = current.kind === 'right'
            ? current.height
            : Math.max(MIN_HEIGHT, Math.round((current.height + dy) * 2) / 2);
        dispatch(actions.space.setPlaneSize({
            planeID,
            width: nextWidth,
            height: nextHeight,
            sizeMode: 'manual',
        }));
    };

    const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) {
            return;
        }
        event.stopPropagation();
        drag.current = null;
        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch (_) { /* released already */ }
        dispatch(actions.space.historyEnd());
    };

    const handleProperties = (kind: 'right' | 'bottom' | 'corner') => ({
        theme: stateInteractionTheme,
        kind,
        onPointerDown: onPointerDown(kind),
        onPointerMove,
        onPointerUp: onPointerEnd,
        onPointerCancel: onPointerEnd,
        'data-plurid-control': 'plane-resize-' + kind,
        'data-plurid-entity': PLURID_ENTITY_PLANE_RESIZE_HANDLE,
        role: 'separator',
        'aria-label': 'resize plane ' + kind,
    });

    return (
        <>
            <StyledHandle {...handleProperties('right')} />
            <StyledHandle {...handleProperties('bottom')} />
            <StyledHandle {...handleProperties('corner')} />
        </>
    );
};


const mapStateToProperties = (
    state: AppState,
): PluridPlaneResizeHandlesStateProperties => ({
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateScale: state.space.camera.scale,
});

const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneResizeHandlesDispatchProperties => ({
    dispatch,
});


const ConnectedPluridPlaneResizeHandles = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneResizeHandles);
// #endregion module



// #region exports
export default ConnectedPluridPlaneResizeHandles;
// #endregion exports
