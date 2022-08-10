// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridDrawer,
        StyledPluridDrawerHeading,
        StyledPluridDrawerItems,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    typography: {
        Heading: PluridHeading,
    },
} = universal;

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
        global,
    } = configuration;

    const {
        transparentUI,
    } = global;


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


const ConnectedPluridDrawer = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridDrawer);
// #endregion module



// #region exports
export default ConnectedPluridDrawer;
// #endregion exports
