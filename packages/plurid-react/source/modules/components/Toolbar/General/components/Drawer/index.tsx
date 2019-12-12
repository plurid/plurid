import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridHeading,
} from '@plurid/plurid-ui-react';

import {
    StyledDrawer,
    StyledDrawerHeading,
    StyledDrawerItems,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



interface DrawerOwnProperties {
    heading: string;
    items: JSX.Element;
    toggled: boolean;
    toggle(): void;
}

interface DrawerStateProperties {
    interactionTheme: Theme;
}

interface DrawerDispatchProperties {
}

type DrawerProperties = DrawerOwnProperties
    & DrawerStateProperties
    & DrawerDispatchProperties;

const Drawer: React.FC<DrawerProperties> = (properties) => {
    const {
        /** own */
        heading,
        items,
        toggled,
        toggle,

        /** state */
        interactionTheme,

        /** dispatch */
    } = properties;

    return (
        <StyledDrawer
            theme={interactionTheme}
        >
            <StyledDrawerHeading
                onClick={() => toggle()}
            >
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    {heading}
                </PluridHeading>
            </StyledDrawerHeading>

            {toggled && (
                <StyledDrawerItems>
                    {items}
                </StyledDrawerItems>
            )}
        </StyledDrawer>
    );
}


const mapStateToProps = (
    state: AppState,
): DrawerStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): DrawerDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(Drawer);
