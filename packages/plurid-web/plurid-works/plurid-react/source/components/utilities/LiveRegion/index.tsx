// #region imports
    // #region libraries
    import React, {
        useEffect,
        useState,
    } from 'react';

    import { connect } from 'react-redux';

    import styled from 'styled-components';


    import {

        chromeRoot,

    } from '~services/styled/chrome';

    import {
        PLURID_ENTITY_LIVE_REGION,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        space as spaceEngine,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
/** @deprecated Import `PLURID_ENTITY_LIVE_REGION` from `@plurid/plurid-data`. */
export { PLURID_ENTITY_LIVE_REGION };


/** Visually hidden, read by assistive technology. */
const StyledLiveRegion = styled.div`
    ${chromeRoot}
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
`;


export interface PluridLiveRegionStateProperties {
    stateActiveRoute: string;
    stateSelectionCount: number;
    stateMotion: string;
}

export type PluridLiveRegionProperties = PluridLiveRegionStateProperties;


/**
 * The engine's `aria-live` announcements: the active plane (as its route) when it changes, the
 * selection size, and the end of a camera move. Polite, so it never interrupts the reader.
 */
const PluridLiveRegion: React.FC<PluridLiveRegionProperties> = (
    {
        stateActiveRoute,
        stateSelectionCount,
        stateMotion,
    },
) => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (stateActiveRoute) {
            setMessage('plane ' + stateActiveRoute);
        }
    }, [stateActiveRoute]);

    useEffect(() => {
        if (stateSelectionCount > 0) {
            setMessage(stateSelectionCount === 1 ? '1 plane selected' : stateSelectionCount + ' planes selected');
        }
    }, [stateSelectionCount]);

    useEffect(() => {
        if (stateMotion === 'idle' && stateActiveRoute) {
            setMessage('viewing plane ' + stateActiveRoute);
        }
    }, [stateMotion]);

    return (
        <StyledLiveRegion
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-plurid-entity={PLURID_ENTITY_LIVE_REGION}
        >
            {message}
        </StyledLiveRegion>
    );
};


const mapStateToProperties = (
    state: AppState,
): PluridLiveRegionStateProperties => {
    const activePlaneID = selectors.space.getActivePlaneID(state);
    const plane = activePlaneID
        ? spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, activePlaneID)
        : undefined;
    return {
        stateActiveRoute: plane?.route || '',
        stateSelectionCount: selectors.space.getSelectedPlaneIDs(state).length,
        stateMotion: state.space.motion,
    };
};


const ConnectedPluridLiveRegion = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridLiveRegion);
// #endregion module



// #region exports
export default ConnectedPluridLiveRegion;
// #endregion exports
