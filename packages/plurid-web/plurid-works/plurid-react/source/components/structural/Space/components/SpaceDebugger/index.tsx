// #region imports
    // #region libraries
    import React, {
        useEffect,
        useRef,
        useState,
    } from 'react';

    import {
        connect,
        ReactReduxContext,
    } from 'react-redux';

    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        CameraState,
        CameraMotion,
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
export const PLURID_ENTITY_SPACE_DEBUGGER = 'PluridSpaceDebugger';


const StyledPluridSpaceDebugger = styled.pre<{ theme: Theme }>`
    position: absolute;
    top: 8px;
    left: 8px;
    margin: 0;
    padding: 8px 10px;
    z-index: ${Z_INDEX.DEBUGGER};
    font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: ${({ theme }) => theme.colorPrimary};
    background-color: ${({ theme }) => theme.backgroundColorPrimaryAlpha};
    border: 1px solid ${({ theme }) => theme.backgroundColorTertiary};
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
    stateSelectionCount: number;
    stateActivePlaneID: string;
}

export type PluridSpaceDebuggerProperties = PluridSpaceDebuggerStateProperties;


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
 * The performance HUD (`development.spaceDebugger` / `?debug=1`): frames per second (a rAF EMA),
 * store dispatches per second, planes mounted / culled / frozen, the camera and the motion state.
 * Reads the store through the context so the counters never re-render the space.
 */
const PluridSpaceDebugger: React.FC<PluridSpaceDebuggerProperties> = (
    properties,
) => {
    const {
        stateGeneralTheme,
        stateCamera,
        stateMotion,
        statePlanesMounted,
        statePlanesHidden,
        statePlanesFrozen,
        stateSelectionCount,
        stateActivePlaneID,
    } = properties;

    const reduxContext = React.useContext(StateContext as unknown as typeof ReactReduxContext);
    const [fps, setFps] = useState(0);
    const [dispatchesPerSecond, setDispatchesPerSecond] = useState(0);
    const dispatches = useRef(0);

    useEffect(() => {
        const store = reduxContext?.store;
        const unsubscribe = store
            ? store.subscribe(() => { dispatches.current += 1; })
            : undefined;

        let frame: number | null = null;
        let last = performance.now();
        let ema = 60;
        let windowStart = last;
        let frames = 0;
        const tick = (now: number) => {
            const dt = now - last;
            last = now;
            if (dt > 0) {
                ema = ema * 0.9 + (1000 / dt) * 0.1;
            }
            frames += 1;
            if (now - windowStart >= 500) {
                setFps(Math.round(ema));
                setDispatchesPerSecond(Math.round(dispatches.current * 1000 / (now - windowStart)));
                dispatches.current = 0;
                windowStart = now;
                frames = 0;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
        };
    }, [reduxContext]);

    const lines = [
        `fps ${fps}   dispatch/s ${dispatchesPerSecond}`,
        `planes ${statePlanesMounted}   hidden ${statePlanesHidden}   frozen ${statePlanesFrozen}`,
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
    statePlanesHidden: state.space.culled?.hidden.length ?? 0,
    statePlanesFrozen: state.space.culled?.frozen.length ?? 0,
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
