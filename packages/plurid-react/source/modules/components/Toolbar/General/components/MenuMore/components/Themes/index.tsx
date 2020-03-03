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
    PluridDropdown,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



interface MenuMoreThemesOwnProperties {
}

interface MenuMoreThemesStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreThemesDispatchProperties {
    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    dispatchSetConfigurationThemeGeneralAction: typeof actions.configuration.setConfigurationThemeGeneralAction;
    dispatchSetConfigurationThemeInteractionAction: typeof actions.configuration.setConfigurationThemeInteractionAction;
}

type MenuMoreThemesProperties = MenuMoreThemesOwnProperties
    & MenuMoreThemesStateProperties
    & MenuMoreThemesDispatchProperties;

const MenuMoreThemes: React.FC<MenuMoreThemesProperties> = (
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
    } = properties;

    const selectedTheme = configuration.theme;

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
        dispatchSetGeneralTheme(themes[selectedTheme]);
        dispatchSetConfigurationThemeGeneralAction(selectedTheme);
    }

    const setInteractionTheme = (selectedTheme: any) => {
        dispatchSetInteractionTheme(themes[selectedTheme]);
        dispatchSetConfigurationThemeInteractionAction(selectedTheme);
    }

    const setLanguage = (
        selectedLanguage: any,
    ) => {

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
            <StyledMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerThemesGeneralTheme)}

                <PluridDropdown
                    selectables={Object.keys(themes)}
                    selected={generalThemeName}
                    atSelect={(selection) => setGeneralTheme(selection)}
                    theme={interactionTheme}
                    heightItems={4}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerThemesInteractionTheme)}

                <PluridDropdown
                    selectables={Object.keys(themes)}
                    selected={interactionThemeName}
                    atSelect={(selection) => setInteractionTheme(selection)}
                    theme={interactionTheme}
                    heightItems={3}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem
                last={true}
            >
                {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerThemesLanguage)}

                <PluridDropdown
                    selectables={internationalization.languages}
                    selected={stateLanguage}
                    atSelect={(selection) => setLanguage(selection)}
                    theme={interactionTheme}
                    heightItems={3}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreThemesStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreThemesDispatchProperties => ({
    dispatchSetConfigurationThemeGeneralAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeGeneralAction(theme)
    ),
    dispatchSetConfigurationThemeInteractionAction: (theme: string) => dispatch(
        actions.configuration.setConfigurationThemeInteractionAction(theme)
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
)(MenuMoreThemes);
