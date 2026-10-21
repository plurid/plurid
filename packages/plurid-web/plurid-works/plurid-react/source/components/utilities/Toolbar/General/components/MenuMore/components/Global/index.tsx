// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import themes, {
        LOOK_NAMES,
        LookName,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        internationalization,

        PluridConfiguration,
        InternationalizationLanguageType,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        pickLook,
        pickTheme,
    } from '~services/state/thunks/look';
    import {
        lookOf,
    } from '~services/look';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const {
    inputs: {
        Dropdown: PluridDropdown,
    },
} = universal;

/** The theme choices: `look` (follow the look), then every theme by name. */
const THEME_CHOICES = ['look', ...Object.keys(themes)];

export interface PluridMenuMoreGlobalOwnProperties {
}

export interface PluridMenuMoreGlobalStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreGlobalDispatchProperties {
    dispatchPickLook: (look: LookName) => void;
    dispatchPickTheme: (part: 'general' | 'interaction', name: string) => void;
    dispatchSetConfigurationLanguage: DispatchAction<typeof actions.configuration.setConfigurationLanguage>;
}

export type PluridMenuMoreGlobalProperties = PluridMenuMoreGlobalOwnProperties
    & PluridMenuMoreGlobalStateProperties
    & PluridMenuMoreGlobalDispatchProperties;


/**
 * THE LOOK, THEN THE THEMES PLANE CONTENT READS (2026-10-21). The drawer offered only the two legacy
 * themes and the language, so the look the chrome and the planes are drawn in could not be changed
 * from the space. A pick is the reader's, for this session: nothing here is saved.
 */
const PluridMenuMoreGlobal: React.FC<PluridMenuMoreGlobalProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchPickLook,
        dispatchPickTheme,
        dispatchSetConfigurationLanguage,
    } = properties;

    const selectedTheme = configuration.global.theme;
    // a Theme object is the host's own: no name to show
    const themeName = (part: 'general' | 'interaction') => {
        const value = typeof selectedTheme === 'object' ? selectedTheme[part] : selectedTheme;
        return typeof value === 'string' ? value : '';
    };
    const chosen = (selection: unknown) => (
        typeof selection === 'string' ? selection : (selection as { id: string }).id
    );

    const dropdown = {
        theme: interactionTheme,
        heightItems: 3,
        width: 90,
        style: {
            fontSize: '0.8rem',
        },
    };


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalLook)}

                <PluridDropdown
                    {...dropdown}
                    selectables={LOOK_NAMES}
                    selected={lookOf(configuration).name}
                    atSelect={(selection) => dispatchPickLook(chosen(selection) as LookName)}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalGeneralTheme)}

                <PluridDropdown
                    {...dropdown}
                    selectables={THEME_CHOICES}
                    selected={themeName('general')}
                    atSelect={(selection) => dispatchPickTheme('general', chosen(selection))}
                    filterable={true}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalInteractionTheme)}

                <PluridDropdown
                    {...dropdown}
                    selectables={THEME_CHOICES}
                    selected={themeName('interaction')}
                    atSelect={(selection) => dispatchPickTheme('interaction', chosen(selection))}
                    filterable={true}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem
                last={true}
            >
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalLanguage)}

                <PluridDropdown
                    {...dropdown}
                    selectables={internationalization.languages}
                    selected={stateLanguage}
                    atSelect={(selection) => dispatchSetConfigurationLanguage(chosen(selection) as InternationalizationLanguageType)}
                />
            </StyledPluridMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreGlobalStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreGlobalDispatchProperties => ({
    dispatchPickLook: (look) => dispatch(pickLook(look) as any),
    dispatchPickTheme: (part, name) => dispatch(pickTheme(part, name) as any),
    dispatchSetConfigurationLanguage: (
        language,
    ) => dispatch(
        actions.configuration.setConfigurationLanguage(language)
    ),
});


const ConnectedPluridMenuMoreGlobal = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreGlobal);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreGlobal;
// #endregion exports
