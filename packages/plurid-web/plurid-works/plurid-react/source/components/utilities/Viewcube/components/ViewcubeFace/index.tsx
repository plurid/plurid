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
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion libraries


    // #region internal
    import {
        faceTransform,
        faceTypes,
        zoneCodes,
        zoneClickTransforms,
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
    dispatchRotateX: DispatchAction<typeof actions.space.rotateX>;
    dispatchRotateY: DispatchAction<typeof actions.space.rotateY>;
    dispatchSetAnimatedTransform: DispatchAction<typeof actions.space.setAnimatedTransform>;
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
        dispatchRotateX,
        dispatchRotateY,
        dispatchSetAnimatedTransform,
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

        dispatchSetAnimatedTransform(true);
        dispatchRotateX(transform.rotateX);
        dispatchRotateY(transform.rotateY);
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
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
                type={faceTypes.topLeft}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topLeft}`]}
                onClick={() => handleClick(faceTypes.topLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topCenter}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topCenter}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topCenter}`]}
                onClick={() => handleClick(faceTypes.topCenter)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topCenter}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topRight}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.topRight}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.topRight}`]}
                onClick={() => handleClick(faceTypes.topRight)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.topRight}`])}
                transparentUI={transparentUI}
            />


            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleLeft}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.middleLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.middleLeft}`]}
                onClick={() => handleClick(faceTypes.middleLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.middleLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleCenter}
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
                type={faceTypes.middleRight}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.middleRight}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.middleRight}`]}
                onClick={() => handleClick(faceTypes.middleRight)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.middleRight}`])}
                transparentUI={transparentUI}
            />


            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomLeft}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.bottomLeft}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.bottomLeft}`]}
                onClick={() => handleClick(faceTypes.bottomLeft)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.bottomLeft}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomCenter}
                active={activeZone === (zoneCodes as any)[`${face}${faceTypes.bottomCenter}`]}
                hovered={hoveredZone === (zoneCodes as any)[`${face}${faceTypes.bottomCenter}`]}
                onClick={() => handleClick(faceTypes.bottomCenter)}
                onMouseEnter={() => setHoveredZone((zoneCodes as any)[`${face}${faceTypes.bottomCenter}`])}
                transparentUI={transparentUI}
            />
            <StyledPluridViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomRight}
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
    dispatchRotateX: (angleX: number) => dispatch(
        actions.space.rotateX(angleX),
    ),
    dispatchRotateY: (angleY: number) => dispatch(
        actions.space.rotateY(angleY),
    ),
    dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
        actions.space.setAnimatedTransform(animated),
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
