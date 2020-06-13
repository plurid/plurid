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
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridHeading,
} from '@plurid/plurid-ui-react';

import {
    StyledPluridDrawer,
    StyledPluridDrawerHeading,
    StyledPluridDrawerItems,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



export interface PluridDrawerOwnProperties {
    heading: string;
    items: JSX.Element;
    toggled: boolean;
    toggle(): void;
}

export interface PluridDrawerStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridDrawerDispatchProperties {
}

export type PluridDrawerProperties = PluridDrawerOwnProperties
    & PluridDrawerStateProperties
    & PluridDrawerDispatchProperties;

const PluridDrawer: React.FC<PluridDrawerProperties> = (
    properties
) => {
    /** properties */
    const {
        /** own */
        heading,
        items,
        toggled,
        toggle,

        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
    } = properties;

    const {
        transparentUI,
    } = configuration;


    /** state */
    const [mouseOver, setMouseOver] = useState(false);


    /** render */
    return (
        <StyledPluridDrawer
            theme={interactionTheme}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            toggled={toggled}
        >
            <StyledPluridDrawerHeading
                theme={interactionTheme}
                onClick={() => toggle()}
            >
                <PluridHeading
                    theme={interactionTheme}
                    type="h5"
                >
                    {heading}
                </PluridHeading>
            </StyledPluridDrawerHeading>

            {toggled && (
                <StyledPluridDrawerItems>
                    {items}
                </StyledPluridDrawerItems>
            )}
        </StyledPluridDrawer>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridDrawerStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridDrawerDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridDrawer);
