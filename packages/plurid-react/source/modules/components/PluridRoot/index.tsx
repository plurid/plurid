import React, {
    useState,
    useContext,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../services/logic/context';

import PluridPlane from '../PluridPlane';

import {
    PLURID_ENTITY_ROOT,

    TreePlane,
    PluridContext
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridRootOwnProperties {
    plane: TreePlane;
}

interface PluridRootStateProperties {
    activeUniverseID: string;
    statePlaneSources: Record<string, string>;
}

interface PluridRootDispatchProperties {
}

type PluridRootProperties = PluridRootOwnProperties
    & PluridRootStateProperties
    & PluridRootDispatchProperties;

const PluridRoot: React.FC<PluridRootProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        plane,

        /** state */
        activeUniverseID,
        statePlaneSources,
    } = properties;

    const {
        location,
    } = plane;


    /** context */
    const context: PluridContext = useContext(Context);
    // console.log(context);

    const {
        planesMap,
        planeContext: PlaneContext,
        planeContextValue,
        // universes,
        // indexedPlanes,
    } = context;

    console.log('planesMap', planesMap);
    console.log('statePlaneSources', statePlaneSources);


    /** state */
    const [childrenPlanes, setChildrenPlanes] = useState<JSX.Element[]>([]);


    /** handlers */
    const computeChildrenPlanes = (plane: TreePlane) => {
        // console.log('computeChildrenPlanes plane', plane);
        if (plane.children) {
            plane.children.map(child => {
                // console.log('child', child);

                if (!statePlaneSources || !planesMap) {
                    return;
                }

                const planeID = statePlaneSources[child.route];
                // console.log('AAAAAA indexedPlanesSources', indexedPlanesSources);
                // console.log('planeID', planeID);
                if (!planeID) {
                    return;
                }

                const activePlane = planesMap.get(planeID);
                // console.log('activePlane', activePlane);
                // const activePlane = activePlanes[child.sourceID];

                let plane = (<></>);
                if (
                    activePlane
                    // && child.show
                ) {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Plane = activePlane.component.element;

                    if (activePlane.component.kind !== 'react') {
                        return;
                    }

                    const properties = activePlane.component.properties || {};
                    const pluridProperties = {
                        parameters: {},
                        query: {},
                        // parameters: child.parameters || {},
                    };

                    plane = (
                        <PluridPlane
                            key={child.planeID}
                            plane={activePlane}
                            treePlane={child}
                            planeID={child.planeID}
                            location={child.location}
                        >
                            {!PlaneContext
                                ? (
                                    <Plane
                                        plurid={pluridProperties}
                                        {...properties}
                                    />
                                ) : (
                                    <PlaneContext.Provider
                                        value={planeContextValue}
                                    >
                                        <Plane
                                            plurid={pluridProperties}
                                            {...properties}
                                        />
                                    </PlaneContext.Provider>
                                )
                            }
                        </PluridPlane>
                    );

                    setChildrenPlanes(planes => [...planes, plane]);
                }

                if (child.children) {
                    computeChildrenPlanes(child);
                }
            });
        }
    }


    /** effects */
    /** Compute children planes */
    useEffect(() => {
        // TODO: explore for optimizations
        // check if the plane is already in the array
        // or get a better dependency than the JSON stringification
        setChildrenPlanes([]);
        computeChildrenPlanes(plane);
    }, [
        JSON.stringify(plane),
    ]);


    /** render */
    const pluridPlaneID = statePlaneSources[plane.route];
    if (!pluridPlaneID) {
        return (
            <></>
        );
    }

    const pluridPlane = planesMap.get(pluridPlaneID);
    console.log('pluridPlane', pluridPlane);
    if (!pluridPlane) {
        return (
            <></>
        );
    }

    if (pluridPlane.component.kind !== 'react') {
        return (
            <></>
        );
    }

    const Plane = pluridPlane.component.element;

    const pageProperties = pluridPlane.component.properties || {};
    const pluridProperties = {
        parameters: {},
        query: {},
    };

    return (
        <StyledPluridRoot
            data-plurid-entity={PLURID_ENTITY_ROOT}
        >
            <PluridPlane
                plane={pluridPlane}
                treePlane={plane}
                planeID={plane.planeID}
                location={location}
            >
                {!PlaneContext
                    ? (
                        <Plane
                            plurid={pluridProperties}
                            {...pageProperties}
                        />
                    ) : (
                        <PlaneContext.Provider
                            value={planeContextValue}
                        >
                            <Plane
                                plurid={pluridProperties}
                                {...pageProperties}
                            />
                        </PlaneContext.Provider>
                    )
                }
            </PluridPlane>

            {childrenPlanes}
        </StyledPluridRoot>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridRootStateProperties => ({
    activeUniverseID: selectors.space.getActiveUniverseID(state),
    statePlaneSources: selectors.data.getPlaneSources(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridRoot);
