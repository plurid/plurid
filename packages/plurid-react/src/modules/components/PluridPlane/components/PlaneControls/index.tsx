import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPlaneControls,
} from './styled';

import {
    PluridAppConfiguration,
} from '../../../../data/interfaces';

import { AppState } from '../../../../services/state/store';
import { ViewSize } from '../../../../services/state/types/data';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    page: any;
    [key: string]: any;
}

interface PlaneControlsStateProperties {
    configuration: PluridAppConfiguration;
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
        <StyledPlaneControls>

            <div>
                <input
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
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PlaneControlsDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PlaneControls);
