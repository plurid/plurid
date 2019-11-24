import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/plurid-themes';

import {
    StyledPlaneControls,
    StyledPlaneControlsLeft,
    StyledPlaneControlsCenter,
    StyledPlaneControlsRight,
} from './styled';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import Styles from '../../../../services/styles';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    page: any;
    [key: string]: any;
}

interface PlaneControlsStateProperties {
    configuration: PluridConfiguration;
    generalTheme: Theme;
    interactionTheme: Theme;
}

interface PlaneControlsDispatchProperties {
}

type PlaneControlsProperties = PlaneControlsOwnProperties
    & PlaneControlsStateProperties
    & PlaneControlsDispatchProperties;

const PlaneControls: React.FC<PlaneControlsProperties> = (properties) => {
    const {
        page,

        configuration,
        generalTheme,
        interactionTheme,
    } = properties;

    let basePath = '';
    if (configuration) {
        if (configuration.planeDomainURL) {
            basePath = window.location.hostname;
        }
    }

    const [path, setPath] = useState(basePath + page.path);

    const onPathInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPath(event.target.value);

        if (configuration.pathChange) {
            configuration.pathChange(event.target.value);
        }
    }

    return (
        <StyledPlaneControls
            theme={generalTheme}
        >
            <StyledPlaneControlsLeft>
            </StyledPlaneControlsLeft>

            <StyledPlaneControlsCenter>
                <Styles.InputText
                    theme={interactionTheme}
                    type="text"
                    value={path}
                    onChange={onPathInput}
                />
            </StyledPlaneControlsCenter>

            <StyledPlaneControlsRight>
            </StyledPlaneControlsRight>
        </StyledPlaneControls>
    );
}


const mapStateToProps = (state: AppState): PlaneControlsStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PlaneControlsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PlaneControls);
