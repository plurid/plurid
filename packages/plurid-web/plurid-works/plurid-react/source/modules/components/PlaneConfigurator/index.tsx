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
        general as generalEngine,
    } from '@plurid/plurid-engine';

    import {
        PLURID_ENTITY_PLANE_CONFIGURATOR,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    // import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlaneConfigurator,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneConfiguratorOwnProperties {
    theme: keyof typeof themes;
    style: React.CSSProperties;
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
    /** properties */
    const {
        /** own */
        theme,
        style,

        /** state */

        /** dispatch */
    } = properties;


    /** references */
    const configuratorElement: React.RefObject<HTMLDivElement> = useRef(null);


    /** state */
    const [planePlaneID, setParentPlaneID] = useState('');


    /** effects */
    /**
     * Get Parent Plane ID
     * Get Plurid Link Coordinates
     */
    useEffect(() => {
        const parentPlaneID = generalEngine.planes.getPluridPlaneIDByData(
            configuratorElement.current,
        );
        setParentPlaneID(parentPlaneID);
    }, []);


    /** render */
    return (
        <StyledPluridPlaneConfigurator
            ref={configuratorElement}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONFIGURATOR}
        />
    );
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneConfiguratorStateProperties => ({

});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneConfiguratorDispatchProperties => ({

});


const ConnectedPluridPlaneConfigurator = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneConfigurator);
// #endregion module



// #region exports
export default ConnectedPluridPlaneConfigurator;
// #endregion exports
