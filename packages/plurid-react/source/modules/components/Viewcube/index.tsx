import React, {
    useState,
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

import {
    StyledViewcube,
    StyledViewcubeArrow,
    StyledViewcubeArrowIcon,
    StyledFitView,
} from './styled';

import ViewcubeModel from './components/ViewcubeModel';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



export interface ViewcubeOwnProperties {
}

export interface ViewcubeStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
}

export interface ViewcubeDispatchProperties {
    dispatchRotateXWith: typeof actions.space.rotateXWith;
    dispatchRotateYWith: typeof actions.space.rotateYWith;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSpaceResetTransform: typeof actions.space.spaceResetTransform;
}

export type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;


const Viewcube: React.FC<ViewcubeProperties> = (
    properties,
) => {
    const {
        /** state */
        stateConfiguration,
        stateInteractionTheme,

        /** dispatch */
        dispatchRotateXWith,
        dispatchRotateYWith,
        dispatchSetAnimatedTransform,
        dispatchSpaceResetTransform,
    } = properties;

    const {
        elements,
    } = stateConfiguration;

    const {
        viewcube,
    } = elements;

    const {
        buttons,
        opaque,
        conceal,
    } = viewcube;

    const [mouseOver, setMouseOver] = useState(false);

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
        }, 450);
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
        }, 450);
    }

    return (
        <StyledViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            conceal={conceal}
            mouseOver={mouseOver}
            data-plurid-entity={PLURID_ENTITY_VIEWCUBE}
        >
            <ViewcubeModel
                mouseOver={mouseOver}
            />

            {mouseOver
            && buttons && (
                <>
                    <StyledViewcubeArrow
                        style={{
                            gridArea: 'pluridViewcubeRotateUp',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            onClick={() => animatedRotate('rotateX', -90.1)}
                        >
                            ▲
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateDown',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            onClick={() => animatedRotate('rotateX', 90.1)}
                        >
                            ▼
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateLeft',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            onClick={() => animatedRotate('rotateY', 90.1)}
                        >
                            ◀
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={stateInteractionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateRight',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={stateInteractionTheme}
                            onClick={() => animatedRotate('rotateY', -90.1)}
                        >
                            ▶
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledFitView
                        onClick={animatedReset}
                    >
                        <PluridIconGlobal />
                    </StyledFitView>
                </>
            )}
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
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


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
