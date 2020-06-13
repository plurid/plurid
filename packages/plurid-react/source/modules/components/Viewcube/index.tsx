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
    StyledPluridViewcube,
    StyledPluridViewcubeArrow,
    StyledPluridViewcubeArrowIcon,
    StyledFitView,
} from './styled';

import PluridViewcubeModel from './components/ViewcubeModel';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



export interface PluridViewcubeOwnProperties {
}

export interface PluridViewcubeStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
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
        <StyledPluridViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            conceal={conceal}
            mouseOver={mouseOver}
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
        </StyledPluridViewcube>
    );
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
)(PluridViewcube);
