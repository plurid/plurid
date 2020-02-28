import React from 'react';

import PluridApp, {
    PluridPage,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import './index.css';
import {
    StyledApp,
} from './styled';

import Head from './components/Head';

import Page from './containers/Page';



const App = () => {
    /** properties */
    const pluridConfiguration = {
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

    const pluridPages: PluridPage[] = [
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
        <StyledApp>
            <Head />

            <PluridApp
                configuration={pluridConfiguration}
                pages={pluridPages}
                view={pluridView}
            />
        </StyledApp>
    );
}


export default App;
