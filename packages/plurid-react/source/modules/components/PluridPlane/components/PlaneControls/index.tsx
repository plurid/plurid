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
    PluridPage,
    TreePage,
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridTextline,
} from '@plurid/plurid-ui-react';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    page: PluridPage;
    treePage: TreePage;
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
        /** own */
        page,
        treePage,

        /** state */
        configuration,
        generalTheme,
        interactionTheme,
    } = properties;

    const {
        transparentUI,
        elements,
    } = configuration;

    const {
        pathbar,
    } = elements.plane.controls;

    let basePath = '';
    if (configuration) {
        if (pathbar.domainURL) {
            basePath = window.location.hostname;
        }
    }

    const [path, setPath] = useState(basePath + treePage.path);

    const onPathInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPath(event.target.value);

        if (pathbar.onChange) {
            const id = page.id || page.path;
            pathbar.onChange(event, id);
        }
    }

    const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (pathbar.onKeyDown) {
            const id = page.id || page.path;
            pathbar.onKeyDown(event, id);
        }
    }

    return (
        <StyledPlaneControls
            theme={generalTheme}
            transparentUI={transparentUI}
        >
            <StyledPlaneControlsLeft>
            </StyledPlaneControlsLeft>

            <StyledPlaneControlsCenter>
                <PluridTextline
                    theme={interactionTheme}
                    text={path}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
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
