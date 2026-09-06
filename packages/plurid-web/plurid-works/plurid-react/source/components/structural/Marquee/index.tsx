// #region imports
    // #region libraries
    import React from 'react';

    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {

        chromeRoot,

    } from '~services/styled/chrome';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PLURID_ENTITY_MARQUEE,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import { useEngineSelector } from '~services/hooks/engine';
    import { chromeModeOf, showsChrome } from '~services/chrome';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import {
        MarqueeRect,
    } from '~services/state/modules/ui';
    // #endregion external
// #endregion imports



// #region module
/** @deprecated Import `PLURID_ENTITY_MARQUEE` from `@plurid/plurid-data`. */
export { PLURID_ENTITY_MARQUEE };


const StyledPluridMarquee = styled.div<{ theme: Theme }>`
    ${chromeRoot}
    position: absolute;
    pointer-events: none;
    border: 1px dashed ${({ theme }) => 'var(--plurid-ink)'};
    background-color: ${({ theme }) => 'var(--plurid-surface)'};
    z-index: ${Z_INDEX.MARQUEE};
`;


export interface PluridMarqueeStateProperties {
    stateMarquee: MarqueeRect | null;
    stateInteractionTheme: Theme;
}

export type PluridMarqueeProperties = PluridMarqueeStateProperties;


/** The rubber-band selection rectangle, in view px (not in the camera transform). */
const PluridMarquee: React.FC<PluridMarqueeProperties> = (
    {
        stateMarquee,
        stateInteractionTheme,
    },
) => {
    const shown = useEngineSelector((state) => state.configuration.elements?.marquee?.show !== false && showsChrome(chromeModeOf(state.configuration), 'marquee'));
    if (!stateMarquee || !shown) {
        return null;
    }

    const left = Math.min(stateMarquee.left, stateMarquee.right);
    const top = Math.min(stateMarquee.top, stateMarquee.bottom);
    const width = Math.abs(stateMarquee.right - stateMarquee.left);
    const height = Math.abs(stateMarquee.bottom - stateMarquee.top);

    return (
        <StyledPluridMarquee
            theme={stateInteractionTheme}
            style={{
                left,
                top,
                width,
                height,
            }}
            data-plurid-entity={PLURID_ENTITY_MARQUEE}
        />
    );
};


const mapStateToProperties = (
    state: AppState,
): PluridMarqueeStateProperties => ({
    stateMarquee: state.ui.marquee,
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const ConnectedPluridMarquee = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridMarquee);
// #endregion module



// #region exports
export default ConnectedPluridMarquee;
// #endregion exports
