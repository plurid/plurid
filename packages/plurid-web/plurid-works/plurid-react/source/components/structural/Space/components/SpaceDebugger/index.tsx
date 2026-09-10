// #region imports
    // #region libraries
    import React, {
        useEffect,
        useState,
    } from 'react';

    import {
        connect,
    } from 'react-redux';

    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        CameraState,
        CameraMotion,
        PluridInspectorRegistry,
        PLURID_ENTITY_SPACE_DEBUGGER,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';
    // #endregion external
// #endregion imports



// #region module
/** @deprecated Import `PLURID_ENTITY_SPACE_DEBUGGER` from `@plurid/plurid-data`. */
export { PLURID_ENTITY_SPACE_DEBUGGER };


const StyledPluridSpaceDebugger = styled.pre<{ theme: Theme }>`
    position: absolute;
    top: 8px;
    left: 8px;
    margin: 0;
    padding: 8px 10px;
    z-index: ${Z_INDEX.DEBUGGER};
    font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: ${({ theme }) => 'var(--plurid-ink)'};
    background-color: ${({ theme }) => 'var(--plurid-surface)'};
    border: 1px solid ${({ theme }) => 'var(--plurid-surface-strong)'};
    border-radius: 6px;
    pointer-events: none;
    user-select: none;
    white-space: pre;
`;


export interface PluridSpaceDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateCamera: CameraState;
    stateMotion: CameraMotion;
    statePlanesMounted: number;
    statePlanesHidden: number;
    statePlanesFrozen: number;
    statePlanesDetached: number;
    stateSelectionCount: number;
    stateActivePlaneID: string;
}

export interface PluridSpaceDebuggerOwnProperties {
    /** The diagnostic registry: the gesture in flight, the planes' renders, the dispatches. */
    inspector?: PluridInspectorRegistry;
}

export type PluridSpaceDebuggerProperties = PluridSpaceDebuggerOwnProperties & PluridSpaceDebuggerStateProperties;


const countShown = (
    tree: AppState['space']['tree'],
): number => {
    let count = 0;
    const walk = (nodes: typeof tree) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            count += 1;
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return count;
};


/**
 * The performance HUD (`development.spaceDebugger`): frames per second (a rAF EMA), the registry's
 * dispatches and renders per second (its deltas, read on the same frame), the gesture in flight,
 * planes mounted / hidden / frozen / detached, the camera and the motion state.
 */
const PluridSpaceDebugger: React.FC<PluridSpaceDebuggerProperties> = (
    properties,
) => {
    const {
        inspector,
        stateGeneralTheme,
        stateCamera,
        stateMotion,
        statePlanesMounted,
        statePlanesHidden,
        statePlanesFrozen,
        statePlanesDetached,
        stateSelectionCount,
        stateActivePlaneID,
    } = properties;

    const [fps, setFps] = useState(0);
    const [dispatchesPerSecond, setDispatchesPerSecond] = useState(0);
    const [rendersPerSecond, setRendersPerSecond] = useState(0);
    const [gesture, setGesture] = useState<string | null>(null);
    const totalRenders = () => {
        let sum = 0;
        inspector?.renders.forEach((count) => { sum += count; });
        return sum;
    };

    useEffect(() => {
        let frame: number | null = null;
        let last = performance.now();
        let ema = 60;
        let windowStart = last;
        let dispatchesSeen = inspector?.dispatches ?? 0;
        let rendersSeen = totalRenders();
        const tick = (now: number) => {
            const dt = now - last;
            last = now;
            if (dt > 0) {
                ema = ema * 0.9 + (1000 / dt) * 0.1;
            }
            if (now - windowStart >= 500) {
                const seconds = (now - windowStart) / 1000;
                setFps(Math.round(ema));
                const dispatches = inspector?.dispatches ?? 0;
                setDispatchesPerSecond(Math.round((dispatches - dispatchesSeen) / seconds));
                dispatchesSeen = dispatches;
                const renders = totalRenders();
                setRendersPerSecond(Math.round((renders - rendersSeen) / seconds));
                rendersSeen = renders;
                setGesture(inspector?.gesture ?? null);
                windowStart = now;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
        };
    }, [inspector]);

    const lines = [
        `fps ${fps}   dispatch/s ${dispatchesPerSecond}   renders/s ${rendersPerSecond}   gesture ${gesture ?? '-'}`,
        `planes ${statePlanesMounted}   live ${statePlanesMounted - statePlanesDetached}   hidden ${statePlanesHidden}   frozen ${statePlanesFrozen}   detached ${statePlanesDetached}`,
        `yaw ${stateCamera.yaw.toFixed(1)}  pitch ${stateCamera.pitch.toFixed(1)}  zoom ${stateCamera.scale.toFixed(3)}`,
        `pivot ${Math.round(stateCamera.pivot.x)},${Math.round(stateCamera.pivot.y)},${Math.round(stateCamera.pivot.z)}  offset ${Math.round(stateCamera.offset.x)},${Math.round(stateCamera.offset.y)},${Math.round(stateCamera.offset.z)}`,
        `motion ${stateMotion}   selected ${stateSelectionCount}   active ${stateActivePlaneID || '-'}`,
    ];

    return (
        <StyledPluridSpaceDebugger
            theme={stateGeneralTheme}
            data-plurid-entity={PLURID_ENTITY_SPACE_DEBUGGER}
            data-plurid-overlay="debugger"
            aria-hidden="true"
        >
            {lines.join('\n')}
        </StyledPluridSpaceDebugger>
    );
};


const mapStateToProperties = (
    state: AppState,
): PluridSpaceDebuggerStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateCamera: state.space.camera,
    stateMotion: state.space.motion,
    statePlanesMounted: countShown(state.space.tree),
    statePlanesHidden: state.space.culled.hidden.length,
    statePlanesFrozen: state.space.culled.frozen.length,
    statePlanesDetached: state.space.culled.detached.length,
    stateSelectionCount: state.space.selectedPlaneIDs.length,
    stateActivePlaneID: state.space.activePlaneID,
});


const ConnectedPluridSpaceDebugger = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridSpaceDebugger);
// #endregion module



// #region exports
export default ConnectedPluridSpaceDebugger;
// #endregion exports
