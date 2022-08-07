// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        /** constants */
        PLURID_ENTITY_VIEWCUBE,

        /** interfaces */
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconGlobal,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridViewcube,
        StyledPluridViewcubeArrow,
        StyledPluridViewcubeArrowIcon,
        StyledFitView,
    } from './styled';

    import PluridViewcubeModel from './components/ViewcubeModel';
    import PluridViewcubeTransformAreas from './components/ViewcubeTransformAreas';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridViewcubeOwnProperties {
}

export interface PluridViewcubeStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
    stateTransformTime: number;
}

export interface PluridViewcubeDispatchProperties {
    dispatchRotateXWith: typeof actions.space.rotateXWith;
    dispatchRotateYWith: typeof actions.space.rotateYWith;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSpaceResetTransform: typeof actions.space.spaceResetTransform;
}

export type PluridViewcubeProperties = PluridViewcubeOwnProperties
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
        stateTransformTime,
        // #endregion state

        // #region dispatch
        dispatchRotateXWith,
        dispatchRotateYWith,
        dispatchSetAnimatedTransform,
        dispatchSpaceResetTransform,
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
    const animatedRotate = (
        type: string,
        value: number,
    ) => {
        dispatchSetAnimatedTransform(true);
        switch (type) {
            case 'rotateX':
                dispatchRotateXWith(value);
                break;
            case 'rotateY':
                dispatchRotateYWith(value);
                break;
        }
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, stateTransformTime);
    }

    const animatedReset = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey) {
            // fit into view
            return;
        }

        // reset view
        dispatchSetAnimatedTransform(true);
        dispatchSpaceResetTransform();
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, stateTransformTime);
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setIsMounted(true);
    }, []);
    // #endregion effects


    // #region render
    if (!showViewcube) {
        return (<></>);
    }

    return (
        <StyledPluridViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            conceal={conceal}
            mouseOver={mouseOver}
            isMounted={isMounted}
            fadeInTime={fadeInTime}
            data-plurid-entity={PLURID_ENTITY_VIEWCUBE}
        >
            <PluridViewcubeModel
                mouseOver={mouseOver}
            />

            {mouseOver
            && buttons && (
                <>
                    <StyledPluridViewcubeArrow
                        style={{
                            gridArea: 'PVRotateUp',
                        }}
                    >
                        <StyledPluridViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            onClick={() => animatedRotate('rotateX', -90.1)}
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
                            onClick={() => animatedRotate('rotateX', 90.1)}
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
                            onClick={() => animatedRotate('rotateY', 90.1)}
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
                            onClick={() => animatedRotate('rotateY', -90.1)}
                        >
                            ▶
                        </StyledPluridViewcubeArrowIcon>
                    </StyledPluridViewcubeArrow>

                    <StyledFitView
                        onClick={animatedReset}
                    >
                        <PluridIconGlobal />
                    </StyledFitView>
                </>
            )}

            <PluridViewcubeTransformAreas />
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
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewcubeDispatchProperties => ({
    dispatchRotateXWith: (value: number) => dispatch(
        actions.space.rotateXWith(value)
    ),
    dispatchRotateYWith: (value: number) => dispatch(
        actions.space.rotateYWith(value)
    ),
    dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
        actions.space.setAnimatedTransform(animated)
    ),
    dispatchSpaceResetTransform: () => dispatch(
        actions.space.spaceResetTransform()
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
