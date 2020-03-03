import React, {
    useState,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    internationalization,

    PluridConfiguration,
    InternationalizationLanguageType,
} from '@plurid/plurid-data';

import {
    internatiolate,
} from '@plurid/plurid-engine';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridSlider,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
// import actions from '../../../../../../../services/state/actions';



interface MenuMoreTechnicalOwnProperties {
}

interface MenuMoreTechnicalStateProperties {
    stateLanguage: InternationalizationLanguageType;
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
}

interface MenuMoreTechnicalDispatchProperties {
}

type MenuMoreTechnicalProperties = MenuMoreTechnicalOwnProperties
    & MenuMoreTechnicalStateProperties
    & MenuMoreTechnicalDispatchProperties;

const MenuMoreTechnical: React.FC<MenuMoreTechnicalProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        stateConfiguration,
        stateInteractionTheme,

        /** dispatch */
    } = properties;

    const {
        cullingDistance,
    } = stateConfiguration.space;


    /** state */
    const [localCullingDistance, setLocalCullingDistance] = useState(cullingDistance);


    /** handlers */
    const handleCullingDistance = (
        value: number,
    ) => {
        setLocalCullingDistance(value)
    }


    /** render */
    return (
        <>
            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTechnicalCullingDistance)}
                </div>

                <PluridSlider
                    theme={stateInteractionTheme}
                    value={localCullingDistance}
                    atChange={handleCullingDistance}
                    min={1_000}
                    max={5_000}
                    defaultValue={1_500}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreTechnicalStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreTechnicalDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreTechnical);
