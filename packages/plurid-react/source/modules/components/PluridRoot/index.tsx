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



export interface PluridRootOwnProperties {
    plane: TreePlane;
}

interface PluridRootStateProperties {
    activeUniverseID: string;
}

interface PluridRootDispatchProperties {
}

type PluridRootProperties = PluridRootOwnProperties
    & PluridRootStateProperties
    & PluridRootDispatchProperties;

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: PluridContext = useContext(Context);
    // console.log(context);

    const {
        planeContext: PageContext,
        planeContextValue,
        universes,
    } = context;

    const {
        /** own */
        plane,

        /** state */
        activeUniverseID,
    } = properties;

    const {
        location,
    } = plane;

    const [childrenPlanes, setChildrenPlanes] = useState<JSX.Element[]>([]);

    const computeChildrenPlanes = (plane: TreePlane) => {
        if (plane.children) {
            plane.children.map(child => {
                const _page = activePlanes[child.sourceID];

                let plane = (<></>);
                if (_page && child.show) {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Page = _page.component.element;
                    const properties = _page.component.properties || {};
                    const pluridProperties = {
                        paramters: {},
                        // parameters: child.parameters || {},
                        query: {},
                    };

                    plane = (
                        <PluridPlane
                            key={child.planeID}
                            plane={_page}
                            treePlane={child}
                            planeID={child.planeID}
                            location={child.location}
                        >
                            {!PageContext
                                ? (
                                    <Page
                                        plurid={pluridProperties}
                                        {...properties}
                                    />
                                ) : (
                                    <PageContext.Provider
                                        value={planeContextValue}
                                    >
                                        <Page
                                            plurid={pluridProperties}
                                            {...properties}
                                        />
                                    </PageContext.Provider>
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

    const activeUniverse = universes[activeUniverseID];
    // console.log('activeUniverse', activeUniverse);
    if (!activeUniverse) {
        return (<></>);
    }
    // console.log('activeUniverse', activeUniverse);
    const activePlanes = activeUniverse.planes;
    if (!activePlanes) {
        return (<></>);
    }
    // console.log('activePages', activePages);

    const pluridPlane = activePlanes[plane.sourceID];
    // console.log('pluridPage', pluridPage);

    if (!pluridPlane) {
        return (<></>);
    }

    const Page = pluridPlane.component.element;
    // console.log(Page);

    const pageProperties = pluridPlane.component.properties || {};
    const pluridProperties = {
        parameters: {},
        // parameters: page.parameters || {},
        query: {},
    };

    return (
        <StyledPluridRoot
            data-plurid-entity={PLURID_ENTITY_ROOT}
        >
            <PluridPlane
                plane={pluridPlane}
                treePlane={plane}
                planeID={plane.sourceID}
                location={location}
            >
                {!PageContext
                    ? (
                        <Page
                            plurid={pluridProperties}
                            {...pageProperties}
                        />
                    ) : (
                        <PageContext.Provider
                            value={planeContextValue}
                        >
                            <Page
                                plurid={pluridProperties}
                                {...pageProperties}
                            />
                        </PageContext.Provider>
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
