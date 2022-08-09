// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';


    import themes from '@plurid/plurid-themes';

    import {
        PLURID_ENTITY_PLANE_CONFIGURATOR,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    // import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        planes,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlaneConfigurator,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    getPluridPlaneIDByData,
} = planes;



export interface PluridPlaneConfiguratorOwnProperties {
    // #region required
        // #region values
        theme: keyof typeof themes;
        style: React.CSSProperties;
        // #endregion values
    // #endregion required
}

export interface PluridPlaneConfiguratorStateProperties {
}

export interface PluridPlaneConfiguratorDispatchProperties {
}

export type PluridPlaneConfiguratorProperties = PluridPlaneConfiguratorOwnProperties
    & PluridPlaneConfiguratorStateProperties
    & PluridPlaneConfiguratorDispatchProperties;


/**
 * Goes up the tree to find the first plurid plane
 * and update it's properties.
 *
 * @param properties
 */
const PluridPlaneConfigurator: React.FC<React.PropsWithChildren<PluridPlaneConfiguratorProperties>> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            theme,
            style,
            // #endregion values
        // #endregion required
    } = properties;
    // #endregion properties


    // #region references
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);
    // #endregion references


    // #region state
    const [planePlaneID, setParentPlaneID] = useState('');
    // #endregion state


    // #region effects
    /**
     * Get Parent Plane ID
     * Get Plurid Link Coordinates
     */
    useEffect(() => {
        const parentPlaneID = getPluridPlaneIDByData(
            configuratorElement.current,
        );
        setParentPlaneID(parentPlaneID);
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledPluridPlaneConfigurator
            ref={configuratorElement}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONFIGURATOR}
        />
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneConfiguratorStateProperties => ({
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneConfiguratorDispatchProperties => ({
});


const ConnectedPluridPlaneConfigurator = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneConfigurator);
// #endregion module



// #region exports
export default ConnectedPluridPlaneConfigurator;
// #endregion exports
