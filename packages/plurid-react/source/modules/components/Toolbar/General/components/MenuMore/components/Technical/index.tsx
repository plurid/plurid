import React, {
    useState,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

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
        stateInteractionTheme,

        /** dispatch */
    } = properties;


    /** state */
    const [localCullingDistance, setLocalCullingDistance] = useState(10_000);


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
                    culling distance
                </div>

                <PluridSlider
                    theme={stateInteractionTheme}
                    value={localCullingDistance}
                    atChange={handleCullingDistance}
                    min={1_000}
                    max={21_000}
                    defaultValue={10_000}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreTechnicalStateProperties => ({
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
