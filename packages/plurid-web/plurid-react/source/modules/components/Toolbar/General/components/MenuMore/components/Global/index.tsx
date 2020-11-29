import React, {
    useState,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import themes, {
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

import {
    StyledPluridMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



const {
    inputs: {
        Dropdown: PluridDropdown,
    },
} = universal;

export interface PluridMenuMoreGlobalOwnProperties {
}

export interface PluridMenuMoreGlobalStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreGlobalDispatchProperties {
    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    dispatchSetConfigurationThemeGeneralAction: typeof actions.configuration.setConfigurationThemeGeneralAction;
    dispatchSetConfigurationThemeInteractionAction: typeof actions.configuration.setConfigurationThemeInteractionAction;
    dispatchSetConfigurationLanguage: typeof actions.configuration.setConfigurationLanguageAction;
}

export type PluridMenuMoreGlobalProperties = PluridMenuMoreGlobalOwnProperties
    & PluridMenuMoreGlobalStateProperties
    & PluridMenuMoreGlobalDispatchProperties;


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
        dispatchSetGeneralTheme,
        dispatchSetInteractionTheme,
        dispatchSetConfigurationThemeGeneralAction,
        dispatchSetConfigurationThemeInteractionAction,
        dispatchSetConfigurationLanguage,
    } = properties;

    const selectedTheme = configuration.global.theme;

    const [generalThemeName, setGeneralThemeName] = useState(
        typeof selectedTheme === 'object'
            ? selectedTheme.general
            : selectedTheme
    );
    const [interactionThemeName, setInteractionThemeName] = useState(
        typeof selectedTheme === 'object'
            ? selectedTheme.interaction
            : selectedTheme
    );

    const setGeneralTheme = (selectedTheme: any) => {
        dispatchSetGeneralTheme((themes as any)[selectedTheme]);
        dispatchSetConfigurationThemeGeneralAction(selectedTheme);
    }

    const setInteractionTheme = (selectedTheme: any) => {
        dispatchSetInteractionTheme((themes as any)[selectedTheme]);
        dispatchSetConfigurationThemeInteractionAction(selectedTheme);
    }

    const setLanguage = (
        selectedLanguage: any,
    ) => {
        dispatchSetConfigurationLanguage(selectedLanguage);
    }

    useEffect(() => {
        if (typeof selectedTheme === 'object') {
            setGeneralThemeName(selectedTheme.general);
            setInteractionThemeName(selectedTheme.interaction);
        } else {
            setGeneralThemeName(selectedTheme);
            setInteractionThemeName(selectedTheme);
        }
    }, [
        selectedTheme,
    ]);


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalGeneralTheme)}

                <PluridDropdown
                    selectables={Object.keys(themes)}
                    selected={typeof generalThemeName === 'string' ? generalThemeName : ''}
                    atSelect={(selection) => setGeneralTheme(selection)}
                    theme={interactionTheme}
                    filterable={true}
                    heightItems={3}
                    width={90}
                    style={{
                        fontSize: '0.8rem',
                    }}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalInteractionTheme)}

                <PluridDropdown
                    selectables={Object.keys(themes)}
                    selected={typeof interactionThemeName === 'string' ? interactionThemeName : ''}
                    atSelect={(selection) => setInteractionTheme(selection)}
                    theme={interactionTheme}
                    heightItems={3}
                    filterable={true}
                    width={90}
                    style={{
                        fontSize: '0.8rem',
                    }}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem
                last={true}
            >
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerGlobalLanguage)}

                <PluridDropdown
                    selectables={internationalization.languages}
                    selected={stateLanguage}
                    atSelect={(selection) => setLanguage(selection)}
                    theme={interactionTheme}
                    heightItems={3}
                    width={90}
                    style={{
                        fontSize: '0.8rem',
                    }}
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
    dispatchSetConfigurationThemeGeneralAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeGeneralAction(theme)
    ),
    dispatchSetConfigurationThemeInteractionAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeInteractionAction(theme)
    ),
    dispatchSetConfigurationLanguage: (
        language,
    ) => dispatch(
        actions.configuration.setConfigurationLanguageAction(language)
    ),

    dispatchSetGeneralTheme: (theme: Theme) => dispatch(
        actions.themes.setGeneralTheme(theme)
    ),
    dispatchSetInteractionTheme: (theme: Theme) => dispatch(
        actions.themes.setInteractionTheme(theme)
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreGlobal);
