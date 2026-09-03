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
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        StyledPluridViewcubeFace,
        StyledPluridViewcubeFaceZone,
    } from './styled';

    import { AppState } from '~services/state/store';
    import {
        cameraCommand,
        CameraCommand,
    } from '~services/logic/camera';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // #endregion libraries


    // #region internal
    import {
        faceTransform,
        faceTypes,
        zoneCodes,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridViewcubeFaceOwnProperties {
    face: string;
    faceText: string;
    mouseOver: boolean;
    hoveredZone: string;
    setHoveredZone: React.Dispatch<React.SetStateAction<string>>;
    activeZone: string;
    setActiveZone: React.Dispatch<React.SetStateAction<string>>;
}

export interface PluridViewcubeFaceStateProperties {
    generalTheme: Theme;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridViewcubeFaceDispatchProperties {
    dispatchCameraCommand: (command: CameraCommand) => void;
}

export type PluridViewcubeFaceProperties =
    & PluridViewcubeFaceOwnProperties
    & PluridViewcubeFaceStateProperties
    & PluridViewcubeFaceDispatchProperties;


const PluridViewcubeFace: React.FC<PluridViewcubeFaceProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** own */
        face,
        faceText,
        mouseOver,
        hoveredZone,
        setHoveredZone,
        activeZone,
        setActiveZone,

        /** state */
        generalTheme,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchCameraCommand,
    } = properties;

    const {
        global,
        elements,
    } = configuration;

    const {
        transparentUI,
    } = global;

    const opaqueFace = elements.viewcube.opaque;
    // #endregion properties


    // #region handlers
    const handleClick = (
        type: string,
    ) => {
        const faceType = `${face}${type}`;
        const zoneCode = (zoneCodes as any)[faceType];
        const transform = (faceTransform as any)[zoneCode];
        // console.log(zoneCode);
        // console.log(transform);
        setActiveZone(zoneCode);

        // ONE tween to the exact face pose (both angles at once), through the motion controller —
        // interruptible, shortest arc on yaw, one commit per frame.
        dispatchCameraCommand({
            kind: 'delta',
            delta: {
                absolute: {
                    pitch: transform.rotateX,
                    yaw: transform.rotateY,
                },
            },
        });
    }
    // #endregion handlers


    // #region render
    return (
        <StyledPluridViewcubeFace
            theme={generalTheme}
            face={face}
            opaque={opaqueFace}
            mouseOver={mouseOver}
        >
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.topLeft}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} topLeft`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topLeft}`]}
                onClick={() => handleClick(faceTypes.topLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.topCenter}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} topCenter`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topCenter}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topCenter}`]}
                onClick={() => handleClick(faceTypes.topCenter)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topCenter}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.topRight}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} topRight`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topRight}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topRight}`]}
                onClick={() => handleClick(faceTypes.topRight)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topRight}`])}
                transparentUI={transparentUI}
            />


            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.middleLeft}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} middleLeft`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.middleLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.middleLeft}`]}
                onClick={() => handleClick(faceTypes.middleLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.middleLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.middleCenter}
                type="button"
                tabIndex={0}
                aria-label={`view from ${face} middleCenter`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.middleCenter}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.middleCenter}`]}
                onClick={() => handleClick(faceTypes.middleCenter)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.middleCenter}`])}
                transparentUI={transparentUI}
            >
                {faceText}
            </StyledPluridViewcubeFaceZone>
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.middleRight}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} middleRight`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.middleRight}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.middleRight}`]}
                onClick={() => handleClick(faceTypes.middleRight)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.middleRight}`])}
                transparentUI={transparentUI}
            />


            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.bottomLeft}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} bottomLeft`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.bottomLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.bottomLeft}`]}
                onClick={() => handleClick(faceTypes.bottomLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.bottomLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.bottomCenter}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} bottomCenter`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.bottomCenter}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.bottomCenter}`]}
                onClick={() => handleClick(faceTypes.bottomCenter)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.bottomCenter}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                zone={faceTypes.bottomRight}
                type="button"
                tabIndex={-1}
                aria-label={`view from ${face} bottomRight`}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.bottomRight}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.bottomRight}`]}
                onClick={() => handleClick(faceTypes.bottomRight)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.bottomRight}`])}
                transparentUI={transparentUI}
            />
        </StyledPluridViewcubeFace>
    );
    // #endregion render
};


const mapStateToProperties = (
    state: AppState,
): PluridViewcubeFaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewcubeFaceDispatchProperties => ({
    dispatchCameraCommand: (command) => dispatch(
        cameraCommand(command, { animate: true }) as any,
    ),
});


const ConnectedPluridViewcubeFace = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridViewcubeFace);
// #endregion module



// #region exports
export default ConnectedPluridViewcubeFace;
// #endregion exports
