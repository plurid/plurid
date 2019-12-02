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
    StyledViewcube,
    StyledViewcubeArrow,
} from './styled';

import ViewcubeModel from './components/ViewcubeModel';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
    interactionTheme: Theme;
}

interface ViewcubeDispatchProperties {
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = (properties) => {
    const {
        interactionTheme,
    } = properties;

    const [mouseOver, setMouseOver] = useState(false);

    return (
        <StyledViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
        >
            <ViewcubeModel />

            {mouseOver && (
                <>
                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateUp',
                        }}
                    >
                        ▲
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateDown',
                        }}
                    >
                        ▼
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateLeft',
                        }}
                    >
                        ◀
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateRight',
                        }}
                    >
                        ▶
                    </StyledViewcubeArrow>
                </>
            )}
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
