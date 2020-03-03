import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridIconScale,
} from '@plurid/plurid-icons-react';

import {
    TRANSFORM_MODES,
    internationalization,

    InternationalizationLanguageType,
} from '@plurid/plurid-data';

import {
    internatiolate,
} from '@plurid/plurid-engine';

import {
    StyledToolbarScale,
} from './styled';

import {
    StyledToolbarButton,
    StyledIcon,
} from '../../styled';

import TransformArrow from '../TransformArrow';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
import actions from '../../../../../services/state/actions';



interface ToolbarScaleOwnProperties {
    showTransformButtons: boolean;
    showIcons: boolean;
    transformMode: keyof typeof TRANSFORM_MODES;
    toggleTransform(TYPE: keyof typeof TRANSFORM_MODES): void;
}

interface ToolbarScaleStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
}

interface ToolbarScaleDispatchProperties {
    scaleUp: typeof actions.space.scaleUp;
    scaleDown: typeof actions.space.scaleDown;
}

type ToolbarScaleProperties = ToolbarScaleOwnProperties
    & ToolbarScaleStateProperties
    & ToolbarScaleDispatchProperties;

const ToolbarScale: React.FC<ToolbarScaleProperties> = (properties) => {
    const {
        /** own */
        showTransformButtons,
        showIcons,
        transformMode,
        toggleTransform,

        /** state */
        stateLanguage,
        interactionTheme,

        /** dispatch */
        scaleUp,
        scaleDown,
    } = properties;

    return (
        <StyledToolbarScale
            showTransformButtons={showTransformButtons}
        >
            {showTransformButtons && (
                <TransformArrow
                    direction="up"
                    transform={() => scaleUp()}
                />
            )}

            <StyledToolbarButton
                theme={interactionTheme}
                onClick={() => toggleTransform(TRANSFORM_MODES.SCALE)}
                active={transformMode === TRANSFORM_MODES.SCALE}
                showIcons={showIcons}
                showTransformButtons={showTransformButtons}
                button={showIcons}
            >
                {showIcons
                    ? (
                        <StyledIcon>
                            <PluridIconScale />
                        </StyledIcon>
                    ) : (
                        <>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarTransformScale)}
                        </>
                    )
                }
            </StyledToolbarButton>

            {showTransformButtons && (
                <TransformArrow
                    direction="down"
                    transform={() => scaleDown()}
                />
            )}
        </StyledToolbarScale>
    );
}


const mapStateToProps = (
    state: AppState,
): ToolbarScaleStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarScaleDispatchProperties => ({
    scaleUp: () => dispatch(actions.space.scaleUp()),
    scaleDown: () => dispatch(actions.space.scaleDown()),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(ToolbarScale);
