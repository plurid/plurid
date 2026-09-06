// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconGlobal,
    } from '@plurid/plurid-icons-react';

    import {
        /** constants */
        PLURID_ENTITY_VIEWCUBE,

        /** interfaces */
        PluridConfiguration,
        CameraDelta,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import {
        navigateToParent,
    } from '~services/state/thunks/planes';
    import {
        space as spaceEngine,
    } from '~services/engine';

    import {
        cameraCommand,
        setHome,
        CameraCommand,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import {
        StyledPluridViewcube,
        StyledPluridViewcubeArrow,
        StyledPluridViewcubeArrowIcon,
        StyledFitView,
        StyledDockRail,
        StyledRailButton,
        StyledDockToggle,
        StyledDockBack,
    } from './styled';

    import PluridViewcubeModel from './components/ViewcubeModel';
    // import PluridViewcubeTransformAreas from './components/ViewcubeTransformAreas';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridViewcubeOwnProperties {
}

export interface PluridViewcubeStateProperties {
    stateConfiguration: PluridConfiguration;
    /** The page the camera is docked on (the page presentation), `''` otherwise. */
    stateDockedPlaneID: string;
    /** The docked page has a parent to go back to. */
    stateDockedHasParent: boolean;
    stateInteractionTheme: Theme;
    stateTransformTime: number;
}

export interface PluridViewcubeDispatchProperties {
    dispatchCameraCommand: (command: CameraCommand) => void;
    dispatchSetHome: () => void;
    dispatchNavigateToParent: (planeID: string) => void;
}

export type PluridViewcubeProperties =
    & PluridViewcubeOwnProperties
    & PluridViewcubeStateProperties
    & PluridViewcubeDispatchProperties;


const PluridViewcube: React.FC<PluridViewcubeProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateConfiguration,
        stateDockedPlaneID,
        stateDockedHasParent,
        stateInteractionTheme,
        stateTransformTime,
        // #endregion state

        // #region dispatch
        dispatchCameraCommand,
        dispatchSetHome,
        dispatchNavigateToParent,
        // #endregion dispatch
    } = properties;

    const {
        elements,
        space,
    } = stateConfiguration;

    const {
        viewcube,
    } = elements;

    const {
        buttons,
        conceal,
    } = viewcube;

    const {
        fadeInTime,
    } = space;

    const showViewcube = viewcube.show;
    // #endregion properties


    // #region state
    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);

    const [
        isMounted,
        setIsMounted,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const rotate = (
        delta: CameraDelta,
    ) => {
        dispatchCameraCommand({
            kind: 'delta',
            delta,
        });
    }

    /**
     * Click: fit (frame everything). ⌘/Ctrl-click: the home viewpoint. Alt-click: make the current
     * camera the home viewpoint. Shift-click: the identity view.
     */
    const handleFitView = (event: React.MouseEvent) => {
        if (event.altKey) {
            dispatchSetHome();
            return;
        }
        if (event.ctrlKey || event.metaKey) {
            dispatchCameraCommand({ kind: 'home' });
            return;
        }
        if (event.shiftKey) {
            dispatchCameraCommand({ kind: 'reset' });
            return;
        }
        dispatchCameraCommand({ kind: 'fit' });
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setIsMounted(true);
    }, []);
    // #endregion effects


    // #region render
    const pagePresentation = space.presentation === 'page';
    const docked = !!stateDockedPlaneID;

    // The page presentation's corner control: the door into the space while docked, the way back
    // while revealed; a second chevron goes back to the parent of a spawned page. Rendered even
    // when the viewcube itself is off — it is the page's one affordance.
    const dockControls = pagePresentation && (
        <StyledDockRail data-plurid-rail="">
            {showViewcube && (
                <StyledRailButton
                    type="button"
                    theme={stateInteractionTheme}
                    aria-label="Fit everything (⌘ home, ⇧ reset, ⌥ set home)"
                    title="Fit · ⌘ home · ⇧ reset · ⌥ set home"
                    data-plurid-control="viewcube-fit"
                    data-plurid-rail-button=""
                    onClick={handleFitView}
                >
                    <PluridIconGlobal />
                </StyledRailButton>
            )}
            {docked && stateDockedHasParent && (
                <StyledDockBack
                    type="button"
                    theme={stateInteractionTheme}
                    aria-label="Back to the parent page"
                    title="Back to the parent page"
                    data-plurid-control="dock-back"
                    data-plurid-overlay="dock-back"
                    data-plurid-rail-button=""
                    onClick={() => dispatchNavigateToParent(stateDockedPlaneID)}
                >
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 3.5 5.5 9l5.5 5.5" />
                    </svg>
                </StyledDockBack>
            )}
            <StyledDockToggle
                type="button"
                theme={stateInteractionTheme}
                aria-label={docked ? 'Reveal the space' : 'Back to the page'}
                aria-pressed={!docked}
                title={docked ? 'Reveal the space (G)' : 'Back to the page (Esc)'}
                data-plurid-control="dock-toggle"
                data-plurid-overlay="dock-toggle"
                data-plurid-rail-button=""
                data-plurid-docked-state={docked ? 'docked' : 'revealed'}
                onClick={() => dispatchCameraCommand({ kind: docked ? 'reveal' : 'dock' })}
            >
                {docked ? (
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 2.2 15.2 5.6v6.8L9 15.8 2.8 12.4V5.6L9 2.2Z" />
                        <path d="M2.8 5.6 9 9l6.2-3.4M9 9v6.8" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 2.5h6.5L14 6v9.5H4V2.5Z" />
                        <path d="M10.5 2.5V6H14" />
                    </svg>
                )}
            </StyledDockToggle>
        </StyledDockRail>
    );

    // Without the viewcube the box still hosts the dock controls in the page presentation.
    if (!showViewcube && !pagePresentation) {
        return null;
    }

    return (
        <StyledPluridViewcube
            $page={pagePresentation}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            conceal={conceal}
            mouseOver={mouseOver}
            isMounted={isMounted}
            fadeInTime={fadeInTime}
            data-plurid-entity={PLURID_ENTITY_VIEWCUBE}
            data-plurid-overlay="viewcube"
            data-plurid-control="viewcube"
            data-plurid-hover={mouseOver ? 'true' : 'false'}
        >
            {showViewcube && (
                <PluridViewcubeModel
                    mouseOver={mouseOver}
                />
            )}

            {showViewcube && buttons && (
                <>
                    <StyledPluridViewcubeArrow
                        style={{
                            gridArea: 'PVRotateUp',
                        }}
                    >
                        <StyledPluridViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            type="button"
                            aria-label="Rotate up"
                            title="Rotate up"
                            onClick={() => rotate({ pitch: -90 })}
                        >
                            ▲
                        </StyledPluridViewcubeArrowIcon>
                    </StyledPluridViewcubeArrow>

                    <StyledPluridViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'PVRotateDown',
                        }}
                    >
                        <StyledPluridViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            type="button"
                            aria-label="Rotate down"
                            title="Rotate down"
                            onClick={() => rotate({ pitch: 90 })}
                        >
                            ▼
                        </StyledPluridViewcubeArrowIcon>
                    </StyledPluridViewcubeArrow>

                    <StyledPluridViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'PVRotateLeft',
                        }}
                    >
                        <StyledPluridViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            type="button"
                            aria-label="Rotate left"
                            title="Rotate left"
                            onClick={() => rotate({ yaw: 90 })}
                        >
                            ◀
                        </StyledPluridViewcubeArrowIcon>
                    </StyledPluridViewcubeArrow>

                    <StyledPluridViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'PVRotateRight',
                        }}
                    >
                        <StyledPluridViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            type="button"
                            aria-label="Rotate right"
                            title="Rotate right"
                            onClick={() => rotate({ yaw: -90 })}
                        >
                            ▶
                        </StyledPluridViewcubeArrowIcon>
                    </StyledPluridViewcubeArrow>

                    {!pagePresentation && (
                        <StyledFitView
                            type="button"
                            aria-label="Fit everything (⌘ home, ⇧ reset, ⌥ set home)"
                            onClick={handleFitView}
                            title="Fit · ⌘ home · ⇧ reset · ⌥ set home"
                            data-plurid-control="viewcube-fit"
                        >
                            <PluridIconGlobal />
                        </StyledFitView>
                    )}

                    {/* <PluridViewcubeTransformAreas /> */}
                </>
            )}
            {dockControls}
        </StyledPluridViewcube>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridViewcubeStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateTransformTime: selectors.space.getTransformTime(state),
    stateDockedPlaneID: selectors.space.getDockedPlaneID(state),
    stateDockedHasParent: (() => {
        const docked = selectors.space.getDockedPlaneID(state);
        return !!docked && !!spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, docked)?.parentPlaneID;
    })(),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewcubeDispatchProperties => ({
    // Every viewcube move is an interruptible tween through the motion controller.
    dispatchCameraCommand: (command) => dispatch(
        cameraCommand(command, { animate: true }) as any,
    ),
    dispatchSetHome: () => dispatch(
        setHome() as any,
    ),
    dispatchNavigateToParent: (planeID) => dispatch(
        navigateToParent(planeID) as any,
    ),
});


const ConnectedPluridViewcube = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridViewcube);
// #endregion module



// #region exports
export default ConnectedPluridViewcube;
// #endregion exports
