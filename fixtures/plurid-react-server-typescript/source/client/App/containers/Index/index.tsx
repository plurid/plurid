import React from 'react';

import PluridApp, {
    PluridPartialConfiguration,
    PluridPlane,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import {
    StyledIndex,
} from './styled';

import Head from '../../components/Head';

import Page from './containers/Page';



const Index: React.FC<any> = () => {
    /** properties */
    const pluridConfiguration: PluridPartialConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 2,
                gap: 0.1,
            },
            center: true,
        },
        elements: {
            plane: {
                width: 0.5,
            },
        },
    };

    const pluridPlanes: PluridPlane[] = [
        {
            path: '/page',
            component: {
                element: Page,
                properties: {},
            },
        },
    ];

    const pluridView: PluridView[] = [
        {
            path: '/page',
        }
    ];


    /** render */
    return (
        <StyledIndex>
            <Head />

            <PluridApp
                configuration={pluridConfiguration}
                planes={pluridPlanes}
                view={pluridView}
            />
        </StyledIndex>
    );
}


export default Index;
