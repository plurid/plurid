import React, {
    useState,
    useEffect,
} from 'react';

import styled from 'styled-components';

import PluridApp, {
    PluridSubApp,
    PluridPage,
    PluridRouterBrowser,
    PluridRouterStatic,
    PluridRouterLink,
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


    const appConfiguration: any = {
        theme: 'plurid',
        language: 'romanian',
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
            location: '/',
            view: 'index',
        },
        {
            location: '/one',
            view: 'oneC',
        },
        {
            location: '/two',
            view: 'twoC',
        },
    ];

    const componentIndex: React.FC<any> = () => {
        return (
            <div>
                component index
                <br />
                <PluridRouterLink asAnchor={false} path="/one">link to page one</PluridRouterLink>
                <PluridRouterLink path="/two">link to page two</PluridRouterLink>
            </div>
        );
    }

    const component1: React.FC<any> = () => {
        return (
            <div>
                component one
                <br />
                <PluridRouterLink path="/">link to index page</PluridRouterLink>
                <PluridRouterLink path="/two">link to page two</PluridRouterLink>
            </div>
        );
    }

    const component2: React.FC<any> = () => {
        return (
            <div>
                {/* component two
                <br />
                <PluridRouterLink path="/">link to index page</PluridRouterLink>
                <PluridRouterLink path="/one">link to page one</PluridRouterLink> */}

                <PluridApp
                    configuration={appConfiguration}
                    pages={multiplePages}
                    view={multipleViews}
                />
            </div>
        );
    }

    const components = [
        {
            view: 'index',
            component: componentIndex,
        },
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
            {/* <StyledAdd
                onClick={addPage}
            >
                add page
            </StyledAdd> */}

            <PluridRouterStatic
                path={'/two'}
                routes={routes}
                components={components}
            />

            {/* <PluridRouterBrowser
                routes={routes}
                components={components}
            /> */}
        </div>
    );
}


export default App;
