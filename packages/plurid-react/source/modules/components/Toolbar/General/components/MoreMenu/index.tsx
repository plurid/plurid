import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridSwitch,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenu,
    StyledMoreMenuItem,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    theme: Theme;
    configuration: PluridConfiguration;
}

interface MoreMenuDispatchProperties {
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        theme,
        configuration,
    } = properties;

    const {
        ui,
    } = configuration;

    const {
        toolbar,
    } = ui;

    const {
        alwaysShowIcons,
        alwaysShowTransformButtons,
    } = toolbar;

    return (
        <StyledMoreMenu
            theme={theme}
        >
            <StyledMoreMenuItem>
                <div>
                    always show icons
                </div>

                <PluridSwitch
                    theme={theme}
                    checked={alwaysShowIcons}
                    atChange={() => {}}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    always show transform buttons
                </div>

                <PluridSwitch
                    theme={theme}
                    checked={alwaysShowTransformButtons}
                    atChange={() => {}}
                    level={2}
                />
            </StyledMoreMenuItem>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    theme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({

});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MoreMenu);
