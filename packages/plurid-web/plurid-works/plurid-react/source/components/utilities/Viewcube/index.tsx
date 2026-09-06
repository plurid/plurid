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
    stateInteractionTheme: Theme;
}

export interface PluridViewcubeDispatchProperties {
    dispatchCameraCommand: (command: CameraCommand) => void;
    dispatchSetHome: () => void;
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
        stateInteractionTheme,
        // #endregion state

        // #region dispatch
        dispatchCameraCommand,
        dispatchSetHome,
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
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setIsMounted(true);
    }, []);
    // #endregion effects


    // #region render
    const pagePresentation = space.presentation === 'page';

    if (!showViewcube) {
        return null;
    }

    return (
        <StyledPluridViewcube
            $page={true}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            conceal={conceal && !pagePresentation}
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

                    {/* <PluridViewcubeTransformAreas /> */}
                </>
            )}
        </StyledPluridViewcube>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridViewcubeStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
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
