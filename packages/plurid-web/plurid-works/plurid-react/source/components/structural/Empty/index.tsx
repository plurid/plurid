// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PLURID_ENTITY_EMPTY,
        internationalization,
        InternationalizationLanguageType,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import { internatiolate } from '@plurid/plurid-engine';
    // #endregion external
// #endregion imports



// #region module

const StyledPluridEmpty = styled.div<{ theme: Theme }>`
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    pointer-events: none;
    color: ${({ theme }) => 'var(--plurid-ink-muted)'};
    font-family: ${({ theme }) => 'var(--plurid-font)'};
    letter-spacing: 0.08em;
    font-size: 0.85rem;
    opacity: 0.7;
`;


export interface PluridEmptyStateProperties {
    stateGeneralTheme: Theme;
    stateLanguage: InternationalizationLanguageType;
}

export type PluridEmptyProperties = PluridEmptyStateProperties;


/**
 * The default empty state: rendered by the View in place of the space when the layout resolved to
 * no planes. A host replaces it with the `renderEmpty` slot.
 */
const PluridEmpty: React.FC<PluridEmptyProperties> = (
    {
        stateGeneralTheme,
        stateLanguage,
    },
) => (
    <StyledPluridEmpty
        theme={stateGeneralTheme}
        data-plurid-entity={PLURID_ENTITY_EMPTY}
        role="status"
    >
        {internatiolate(stateLanguage, internationalization.fields.spaceEmpty)}
    </StyledPluridEmpty>
);


const mapStateToProperties = (
    state: AppState,
): PluridEmptyStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
});


const ConnectedPluridEmpty = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridEmpty);
// #endregion module



// #region exports
export default ConnectedPluridEmpty;
// #endregion exports
