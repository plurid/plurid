import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledToolbar,
    StyledToolbarButtons,
} from './styled';

import ToolbarButton from '../Button';

import { Theme } from '@plurid/apps.utilities.themes';

import { AppState } from '../../../services/state/store';
import selectors from '../../../services/state/selectors';
// import actions from '../../services/state/actions';



interface ToolbarOwnProperties {
}

interface ToolbarStateProperties {
    theme: Theme;
}

interface ToolbarDispatchProperties{
}

type ToolbarProperties = ToolbarOwnProperties
    & ToolbarStateProperties
    & ToolbarDispatchProperties;

const Toolbar: React.FC<ToolbarProperties> = (properties) => {
    const [mouseIn, setMouseIn] = useState(false);

    const {
        theme,
    } = properties;

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
        >
            <StyledToolbarButtons
                theme={theme}
            >
                <div>
                    rotate
                </div>

                <div>
                    translate
                </div>

                <div>
                    scale
                </div>
            </StyledToolbarButtons>
        </StyledToolbar>
    );
}


const mapStateToProps = (state: AppState): ToolbarStateProperties => ({
    theme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
