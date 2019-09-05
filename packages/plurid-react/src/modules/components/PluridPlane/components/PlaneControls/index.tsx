import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/apps.utilities.themes';

import {
    StyledPlaneControls,
} from './styled';

import {
    PluridAppConfiguration,
} from '../../../../data/interfaces';

import Styles from '../../../../services/styles';

import { AppState } from '../../../../services/state/store';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    page: any;
    [key: string]: any;
}

interface PlaneControlsStateProperties {
    configuration: PluridAppConfiguration;
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
        if (configuration.planes) {
            if (configuration.planes.domainURL) {
                basePath = window.location.hostname;
            }
        }
    }

    const [path, setPath] = useState(basePath + page.path);

    const onPathInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPath(event.target.value);
    }

    return (
        <StyledPlaneControls
            theme={generalTheme}
        >
            <div
                style={{
                    width: 400,
                    height: 28,
                }}
            >
                <Styles.InputText
                    theme={interactionTheme}
                    type="text"
                    value={path}
                    onChange={onPathInput}
                />
            </div>
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


export default connect(mapStateToProps, mapDispatchToProps)(PlaneControls);
