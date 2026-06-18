// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconSittings,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        StyledSittingTrayButton,
        StyledSittingTrayButtonIcon,
        StyledSittingTrayButtonText,
    } from '../../styled';
    // #endregion external


    // #region internal
    import {
        StyledSittings,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface SittingsOwnProperties {
    selectors: any;
    context: React.Context<any>;
}

export interface SittingsStateProperties {
    stateInteractionTheme: Theme;
}

export interface SittingsDispatchProperties {
}

export type SittingsProperties =
    & SittingsOwnProperties
    & SittingsStateProperties
    & SittingsDispatchProperties;


const Sittings: React.FC<SittingsProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateInteractionTheme,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledSittings
            theme={stateInteractionTheme}
        >
            <StyledSittingTrayButton>
                <StyledSittingTrayButtonIcon>
                    <PluridIconSittings
                        theme={stateInteractionTheme}
                    />
                </StyledSittingTrayButtonIcon>

                <StyledSittingTrayButtonText>
                    sittings
                </StyledSittingTrayButtonText>
            </StyledSittingTrayButton>
        </StyledSittings>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: any,
    ownProperties: any,
): SittingsStateProperties => ({
    stateInteractionTheme: ownProperties.selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): SittingsDispatchProperties => ({
});


const ConnectedSittings = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Sittings);
// #endregion module



// #region exports
export default ConnectedSittings;
// #endregion exports
