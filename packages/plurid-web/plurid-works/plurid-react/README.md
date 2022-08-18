<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid-react/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' <i>for</i> React
</h1>


`React` implementation of [plurid'](https://github.com/plurid/plurid) to view and explore information as a 3D structure.


<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/demo/plurid-com-example.png" height="600px">
</p>



# Install

The simplest manner to setup a "batteries included" `plurid'` web application is to use [@plurid/generate-plurid-app](https://github.com/plurid/plurid/tree/master/packages/generate-plurid-app)

``` bash
npx @plurid/generate-plurid-app
```

In order to setup a plurid' web application in a more specific manner, given a standard setup for a React-based web application (recommended [create-react-app](https://github.com/facebook/create-react-app) template), add the plurid' package

``` bash
npm install @plurid/plurid-react
```

or

``` bash
yarn add @plurid/plurid-react
```


add the peer dependencies

``` bash
npm install \
    @plurid/elementql \
    @plurid/elementql-client-react \
    @plurid/plurid-data \
    @plurid/plurid-engine \
    @plurid/plurid-functions \
    @plurid/plurid-functions-react \
    @plurid/plurid-icons-react \
    @plurid/plurid-pubsub \
    @plurid/plurid-themes \
    @plurid/plurid-ui-components-react \
    @plurid/plurid-ui-state-react \
    @reduxjs/toolkit \
    cross-fetch \
    hammerjs \
    react \
    react-dom \
    react-redux \
    styled-components
```

or

``` bash
yarn add \
    @plurid/elementql \
    @plurid/elementql-client-react \
    @plurid/plurid-data \
    @plurid/plurid-engine \
    @plurid/plurid-functions \
    @plurid/plurid-functions-react \
    @plurid/plurid-icons-react \
    @plurid/plurid-pubsub \
    @plurid/plurid-themes \
    @plurid/plurid-ui-components-react \
    @plurid/plurid-ui-state-react \
    @reduxjs/toolkit \
    cross-fetch \
    hammerjs \
    react \
    react-dom \
    react-redux \
    styled-components
```

add the types (if it is a TypeScript project)

``` bash
npm install -D \
    @types/hammerjs \
    @types/react \
    @types/react-dom \
    @types/react-redux \
    @types/styled-components
```

or

``` bash
yarn add -D \
    @types/hammerjs \
    @types/react \
    @types/react-dom \
    @types/react-redux \
    @types/styled-components
```


A simple, rendering-test application component, could look like

``` tsx
/** imports */
import React from 'react';

import {
    PluridApplication,
    PluridPlane,
} from '@plurid/plurid-react';



/** React Functional Component */
const Application: React.FC<any> = () => {
    /** plurid' planes */
    const pluridPlanes: PluridPlane[] = [
        [
            '/',
            () => (<div>Plurid' Application Plane</div>),
        ],
    ];

    /** plurid' view */
    const pluridView: string[] = [
        '/',
    ];

    /** render */
    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default Application;
```
