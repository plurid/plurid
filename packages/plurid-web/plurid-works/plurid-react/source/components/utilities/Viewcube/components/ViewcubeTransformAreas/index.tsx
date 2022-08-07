// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledViewcubeTransformTranslateX,
        StyledViewcubeTransformTranslateY,
        StyledViewcubeTransformScale,
    } from './styled';

    import TransformArea from './TransformArea';
    // #endregion internal
// #endregion imports



// #region module
export interface ViewcubeTransformAreasOwnProperties {
}

export interface ViewcubeTransformAreasStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface ViewcubeTransformAreasDispatchProperties {
}

export type ViewcubeTransformAreasProperties =
    & ViewcubeTransformAreasOwnProperties
    & ViewcubeTransformAreasStateProperties
    & ViewcubeTransformAreasDispatchProperties;


const ViewcubeTransformAreas: React.FC<ViewcubeTransformAreasProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateGeneralTheme,
        // stateInteractionTheme,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    return (
        <>
            {/* <StyledViewcubeTransformScale>
                <TransformArea
                    theme={stateGeneralTheme}
                    value={0}
                    atChange={(value) => {}}
                />
            </StyledViewcubeTransformScale> */}

            <StyledViewcubeTransformTranslateY
            >
                <TransformArea
                    theme={stateGeneralTheme}
                    value={50}
                    atChange={(value) => {}}
                    position={'vertical'}
                />
            </StyledViewcubeTransformTranslateY>

            <StyledViewcubeTransformTranslateX>
                <TransformArea
                    theme={stateGeneralTheme}
                    value={50}
                    atChange={(value) => {}}
                />
            </StyledViewcubeTransformTranslateX>
        </>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeTransformAreasStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeTransformAreasDispatchProperties => ({
});


const ConnectedViewcubeTransformAreas = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ViewcubeTransformAreas);
// #endregion module



// #region exports
export default ConnectedViewcubeTransformAreas;
// #endregion exports
