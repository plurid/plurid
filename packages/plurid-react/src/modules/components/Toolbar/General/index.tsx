import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledToolbar,
    StyledToolbarButtons,
    StyledToolbarRotate,
    StyledToolbarTranslate,
    StyledToolbarScale,
    StyledToolbarTransformButton,
    StyledToolbarTransformText,
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
                <StyledToolbarRotate>
                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ◀
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        rotate
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▼
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▶
                    </StyledToolbarTransformButton>
                </StyledToolbarRotate>

                <StyledToolbarScale>
                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        scale
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▼
                    </StyledToolbarTransformButton>
                </StyledToolbarScale>

                <StyledToolbarTranslate>
                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ◀
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        translate
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▼
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                    >
                        ▶
                    </StyledToolbarTransformButton>
                </StyledToolbarTranslate>
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
