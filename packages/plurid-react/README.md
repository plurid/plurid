<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/plurid-react/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    Plurid <i>for</i> React
</h1>


React implementation of [Plurid](https://github.com/plurid/plurid) to view and explore the web in three dimensions.



# Install

The most simple manner to setup a "batteries included" plurid' web application is to use [@plurid/generate-plurid-app](https://github.com/plurid/plurid/tree/master/packages/generate-plurid-app)

    npx @plurid/generate-plurid-app

In order to setup a plurid' web application in a more specific manner, given a standard setup for a React-based web application (recommended [create-react-app](https://github.com/facebook/create-react-app)), add the plurid' package

    npm install @plurid/plurid-react

or

    yarn add @plurid/plurid-react

add the dependencies

    npm install @plurid/plurid-functions @plurid/plurid-icons-react @plurid/plurid-themes @plurid/plurid-ui-react hammerjs redux react-redux redux-thunk styled-components

or

    yarn add @plurid/plurid-functions @plurid/plurid-icons-react @plurid/plurid-themes @plurid/plurid-ui-react hammerjs redux react-redux redux-thunk styled-components

add the types (if it is a TypeScript project)

    npm install -D @types/styled-components @types/react-redux

or

    yarn add -D @types/styled-components @types/react-redux


A simple, rendering-test application component, could look like

    /** imports */
    import React from 'react';

    import PluridApp, {
        PluridPage,
    } from '@plurid/plurid-react';



    /** React Functional Component */
    const Application: React.FC<any> = () => {
        /** plurid' pages */
        const pages: PluridPage[] = [
            {
                path: '/',
                component: {
                    element: () => (<div>Plurid' Application</div>),
                },
            },
        ];

        /** plurid' view */
        const view: string[] = [
            '/',
        ];

        /** render */
        return (
            <PluridApp
                pages={pages}
                view={view}
            />
        );
    }


    export default Application;
