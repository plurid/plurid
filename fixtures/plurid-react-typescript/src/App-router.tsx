import React, {
    useState,
    useEffect,
} from 'react';

import styled from 'styled-components';

import PluridApp, {
    PluridPage,
    PluridRouterBrowser,
    PluridRouterStatic,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import {
    uuid,
} from '@plurid/plurid-functions';

import Page1 from './containers/Page1';



const oneHundred = [...new Array(1)].map((_, index) => index);

const multiplePages = oneHundred.map((val) => {
    return {
        path: '/' + val,
        // path: '/:id',
        component: {
            element: Page1,
            properties: {
                value: val,
            },
        },
    };
});

const multipleViews = oneHundred.map((val) => {
    return '/' + val;
});


const StyledAdd = styled.div`
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 9999;
    cursor: pointer;
    user-select: none;
`;

const App = () => {
    const [pluridPages, setPluridPages] = useState<PluridPage[]>([]);
    const [pluridView, setPluridView] = useState<string[]>([]);


    const appConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 8,
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


    const addPage = () => {
        const id = uuid.generate();
        const page: PluridPage = {
            id,
            path: '/' + id,
            component: {
                element: Page1,
                properties: {
                    one: 'one',
                },
            },
        };
        const pages = [
            ...pluridPages,
            page,
        ];
        setPluridPages(pages);

        const view = [
            ...pluridView,
            '/' + id,
        ];
        setPluridView(view);
    }


    useEffect(() => {
        setPluridPages(multiplePages);
        setPluridView(multipleViews);
    }, [
        // multiplePages,
        // multipleViews,
    ]);

    const routes = [
        {
            location: '/one',
            view: 'oneC',
        },
        {
            location: '/two',
            view: 'twoC',
        },
    ];

    const component1: React.FC<any> = () => {
        return (<div>component one</div>);
    }

    const component2: React.FC<any> = () => {
        return (<div>component two</div>);
    }

    const components = [
        {
            view: 'oneC',
            component: component1,
        },
        {
            view: 'twoC',
            component: component2,
        },
    ];


    return (
        <div>
            <StyledAdd
                onClick={addPage}
            >
                add page
            </StyledAdd>

            {/* <PluridRouterStatic
                path={'/one'}
                routes={routes}
                components={components}
            /> */}
            <PluridRouterBrowser
                path={'/two'}
                routes={routes}
                components={components}
            />

            {/* <PluridApp
                configuration={appConfiguration}
                pages={pluridPages}
                view={pluridView}
            /> */}
        </div>
    );
}


export default App;
