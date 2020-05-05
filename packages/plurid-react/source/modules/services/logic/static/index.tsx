import React from 'react';

import {
    TreePlane,
    PluridPlane as IPluridPlane,
    PluridApplication,

    defaultTreePlane,
} from '@plurid/plurid-data';

import PluridRoot from '../../../components/PluridRoot';
import PluridPlane from '../../../components/PluridPlane';
import ToolbarGeneral from '../../../components/Toolbar/General';
import Viewcube from '../../../components/Viewcube';



const renderStatic = (
    data: PluridApplication,
) => {
    const {
        planes,
        indexedPlanes,
    } = data;

    console.log('planes', planes);
    console.log('indexedPlanes', indexedPlanes);

    const pluridPlane: IPluridPlane = {
        component: {
            kind: 'react',
            element: () => (
                <div>
                    element
                </div>
            ),
        },
        path: '/',
    }


    /** render */
    return (
        <div>
            <PluridPlane
                treePlane={defaultTreePlane}
                plane={pluridPlane}
                planeID={''}
                location={{
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                    rotateX: 0,
                    rotateY: 0,
                }}
            />

            <ToolbarGeneral />

            <Viewcube />
        </div>
    );
};


export default renderStatic;
