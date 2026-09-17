// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {
        chromeRoot,
        CHROME_PILL_MARGIN,
    } from '~services/styled/chrome';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        PLURID_ENTITY_MODE_BADGE,
        PLURID_ATTRIBUTE_MODE,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import {
        modeOf,
        PluridMode,
        MODE_LABEL,
        MODE_HINT,
    } from '~services/logic/modes';
    // #endregion external
// #endregion imports



// #region module
const StyledModeBadge = styled.div`
    ${chromeRoot}
    position: absolute;
    left: ${CHROME_PILL_MARGIN}px;
    top: ${CHROME_PILL_MARGIN}px;
    z-index: ${Z_INDEX.TOOLBAR};
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--plurid-control);
    padding: 0 12px;
    border: 1px solid var(--plurid-rim);
    border-radius: var(--plurid-radius);
    background: var(--plurid-surface);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
    color: var(--plurid-ink);
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;

    span:last-child {
        color: var(--plurid-ink-muted);
    }
`;


export interface PluridModeBadgeStateProperties {
    stateMode: PluridMode | undefined;
}

export type PluridModeBadgeProperties = PluridModeBadgeStateProperties;


/**
 * THE MODE, SHOWN. A reader who pressed R (or G, or F) by accident had a space that would not
 * read and nothing on screen to say why: the badge names the mode and the way out. Hidden from
 * assistive technology, which hears the same from the live region.
 */
const PluridModeBadge: React.FC<PluridModeBadgeProperties> = (
    {
        stateMode,
    },
) => {
    if (!stateMode) {
        return null;
    }

    return (
        <StyledModeBadge
            data-plurid-entity={PLURID_ENTITY_MODE_BADGE}
            {...{ [PLURID_ATTRIBUTE_MODE]: stateMode }}
            aria-hidden="true"
        >
            <span>{MODE_LABEL[stateMode]}</span>
            <span>{MODE_HINT[stateMode]}</span>
        </StyledModeBadge>
    );
};


const mapStateToProperties = (
    state: AppState,
): PluridModeBadgeStateProperties => ({
    stateMode: modeOf(state.configuration.space, state.ui.grabMode || state.ui.grabHold),
});


const ConnectedPluridModeBadge = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridModeBadge);
// #endregion module



// #region exports
export default ConnectedPluridModeBadge;
// #endregion exports
