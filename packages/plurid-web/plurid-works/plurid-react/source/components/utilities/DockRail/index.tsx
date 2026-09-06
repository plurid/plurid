// #region imports
    // #region libraries
    import React from 'react';

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
        PluridConfiguration,
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
        cameraCommand,
        setHome,
        CameraCommand,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import {
        StyledDockRail,
        StyledRailButton,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridDockRailStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
    stateDockedPlaneID: string;
    stateDockedParentPlaneID: string;
}

export interface PluridDockRailDispatchProperties {
    dispatchCameraCommand: (command: CameraCommand) => void;
    dispatchSetHome: () => void;
    dispatchNavigateToParent: (planeID: string) => void;
}

export type PluridDockRailProperties = PluridDockRailStateProperties & PluridDockRailDispatchProperties;


/**
 * THE RAIL of the page presentation (`elements.dockRail`, the `renderDockRail` slot): the fit
 * button (when the viewcube is on), a chevron back to the parent of a spawned page, and the corner
 * control — the door into the space while docked, the way back while revealed. Renders nothing
 * in the space presentation.
 */
const PluridDockRail: React.FC<PluridDockRailProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateConfiguration,
        stateInteractionTheme,
        stateDockedPlaneID,
        stateDockedParentPlaneID,
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
    const docked = !!stateDockedPlaneID;
    // #endregion properties


    // #region handlers
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
    };
    // #endregion handlers


    // #region render
    if (space.presentation !== 'page' || elements.dockRail?.show === false) {
        return null;
    }

    return (
        <StyledDockRail
            data-plurid-rail=""
            data-plurid-overlay="dock-rail"
        >
            {elements.viewcube.show && (
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
            {docked && stateDockedParentPlaneID && (
                <StyledRailButton
                    type="button"
                    theme={stateInteractionTheme}
                    aria-label="Back to the parent page"
                    title="Back to the parent page (Esc)"
                    data-plurid-control="dock-back"
                    data-plurid-rail-button=""
                    onClick={() => dispatchNavigateToParent(stateDockedPlaneID)}
                >
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 3.5 5.5 9l5.5 5.5" />
                    </svg>
                </StyledRailButton>
            )}
            <StyledRailButton
                type="button"
                theme={stateInteractionTheme}
                aria-label={docked ? 'Reveal the space' : 'Back to the page'}
                aria-pressed={!docked}
                title={docked ? 'Reveal the space (G)' : 'Back to the page (Esc)'}
                data-plurid-control="dock-toggle"
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
            </StyledRailButton>
        </StyledDockRail>
    );
    // #endregion render
};


const mapStateToProperties = (
    state: AppState,
): PluridDockRailStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateDockedPlaneID: selectors.space.getDockedPlaneID(state),
    stateDockedParentPlaneID: selectors.space.getDockedParentPlaneID(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridDockRailDispatchProperties => ({
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


const ConnectedPluridDockRail = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridDockRail);
// #endregion module



// #region exports
export default ConnectedPluridDockRail;
// #endregion exports
