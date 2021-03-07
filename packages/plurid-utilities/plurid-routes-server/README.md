<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-routes-server">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-routes-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/plurid-utilities/plurid-routes-server/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' Routes Server
</h1>


<h3 align="center">
    Plurid Routes Retrieval and Registration
</h3>



The `plurid-routes-server` is to be used alongside [plurid](https://github.com/plurid/plurid) applications spanning multiple origins in order to resolve the plurid plane routes at client request time.



### Contents

+ [About](#about)
+ [Install](#install)
+ [Setup](#setup)
+ [Codeophon](#codeophon)



## About

The `plurid-routes-server` will respond to a `route` request with the suitable element identification data, based on calling the functions (`queryRoute`, `registerRoute`, `verifyToken`) which are passed at instantiation time.



## Install

Install the package

``` bash
npm install @plurid/plurid-routes-server
```

or

``` bash
yarn add @plurid/plurid-routes-server
```

Install the peer dependencies

```
npm install \
    @plurid/deon \
    @plurid/plurid-functions \
    body-parser \
    express
```

or

```
yarn add \
    @plurid/deon \
    @plurid/plurid-functions \
    body-parser \
    express
```



## Setup

The `PluridRoutesServer` must be instantiated with the following functions:

+ `queryRoute: QueryRoute`
+ `registerRoute: RegisterRoute`
+ `verifyToken: VerifyToken`

which will provide the functionality.

An example (`tests/index.js`), with a mock-up `initialRoutes`, and in-memory (Map) `routes` registration.

``` typescript
// #region imports
import PluridRoutesServer, {
    QueryRoute,
    RegisterRoute,
    VerifyToken,
    RouteElement,
} from '@plurid/plurid-routes-server';
// #endregion imports



// #region data
/**
 * Mock-up data.
 *
 * In the real case, the `initialRoutes` would be loaded from a database,
 * and the `validToken` would assume an authentication/authorization mechanism.
 */

/**
 * Record of `RouteElement | any` to account for the invalid example
 */
const initialRoutes: Record<string, RouteElement | any> = {
    '/example-valid-registered': {
        id: '/example-valid-registered',
    },
    '/example-valid-elementql': {
        elementql: '/example-valid-elementql',
    },
    '/example-invalid': {
    },
};

/**
 * Map of `any` to account for the invalid example.
 * Regular case assumes `Map<string, RouteElement>`
 */
const routes: Map<string, any> = new Map(
    Object.entries(initialRoutes),
);

const validToken = 'token';
// #endregion data



// #region functions
const queryRoute: QueryRoute = async (
    route,
) => {
    console.log('queryRoute', route);

    return routes.get(route);
}

const registerRoute: RegisterRoute = async (
    route,
    data,
) => {
    console.log('registerRoute', route, data);

    routes.set(route, data);

    return true;
}

const verifyToken: VerifyToken = async (
    token,
) => {
    console.log('verifyToken', token);

    return token === validToken;
}
// #endregion functions



// #region server
const server = new PluridRoutesServer({
    queryRoute,
    registerRoute,
    verifyToken,
});


server.handle().post(
    '/cache-reset',
    (request, response) => {
        try {
            if (!request.body.token) {
                console.log('cacheReset bad request');
                response
                    .status(405)
                    .send('Bad Request');
                return;
            }

            if (request.body.token !== validToken) {
                console.log('cacheReset invalid token');
                response
                    .status(403)
                    .send('Forbidden');
                return;
            }

            console.log('cacheReset');
            server.cacheReset();

            response.send('Cache Reseted');
        } catch (error) {
            console.log('cacheReset error', error);

            response
                .status(500)
                .send('Server Error');
        }
    }
);

server.cacheLoad(routes);

server.start();
// #endregion server
```


## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
