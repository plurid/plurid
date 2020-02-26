<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>


<h1 align="center">
    plurid'
</h1>


Explore information as a 3D structure.


The monorepository contains packages implementing the `plurid'` technology to create a 3D browser-powered view based on the [plurid-specification](https://github.com/plurid/plurid/tree/master/packages/plurid-specification).

With `plurid'`, the content of a web page (or any kind of information) can now reside on a `plane of content` (a `Plurid Page`) in a three-dimensional space (a `Plurid Space`). The space can be transformed, rotated, scaled, translated, in order to get a better grasp of the displayed information (text, images, videos, and so forth).

`plurid'` is being used extensively in the <a target="_blank" href="https://plurid.com/products">`plurid' ∂products`</a>, however, new applications can be [easily created](#plurid-application).

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-demo.png" height="600px">
</p>



## Plurid' Application

To generate a `plurid'` web application use the `CLI` tool `@plurid/generate-plurid-app` by running the command (provided you have [`NodeJS`](https://nodejs.org/en/) installed on your machine):

    npx @plurid/generate-plurid-app

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/diagrams/plurid-generate.png" height="600px">
</p>



## Packages


### Generate


<a target="_blank" href="https://www.npmjs.com/package/@plurid/generate-plurid-app">
    <img src="https://img.shields.io/npm/v/@plurid/generate-plurid-app.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/generate-plurid-app][generate-plurid-app] • generate a `plurid'` application with one command (and some choices)

[generate-plurid-app]: https://github.com/plurid/plurid/tree/master/packages/generate-plurid-app



### Tools


<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-data">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-data.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-data][plurid-data] • constants, enumerations, interfaces

[plurid-data]: https://github.com/plurid/plurid/tree/master/packages/plurid-data



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-engine">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-engine.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-engine][plurid-engine] • 3D and utility functions

[plurid-engine]: https://github.com/plurid/plurid/tree/master/packages/plurid-engine



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-pubsub">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-pubsub.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-pubsub][plurid-pubsub] • publish/subscribe message bus

[plurid-pubsub]: https://github.com/plurid/plurid/tree/master/packages/plurid-pubsub



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-renderer">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-renderer.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-renderer][plurid-renderer] • rendering engine

[plurid-renderer]: https://github.com/plurid/plurid/tree/master/packages/plurid-renderer -->



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-scripts">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-scripts.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-scripts][plurid-scripts] • build/development utility functions

[plurid-scripts]: https://github.com/plurid/plurid/tree/master/packages/plurid-scripts -->



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-server">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-server][plurid-server] • server for server-side rendering and application serving

[plurid-server]: https://github.com/plurid/plurid/tree/master/packages/plurid-server -->


[@plurid/plurid-specification][plurid-specification] • plurid' specification

[plurid-specification]: https://github.com/plurid/plurid/tree/master/packages/plurid-specification


<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-state">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-state.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-state][plurid-state] • state management for a plurid application

[plurid-state]: https://github.com/plurid/plurid/tree/master/packages/plurid-state -->



### Implementations


<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-html">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-html.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-html][plurid-html] • implementation for HTML Custom Elements

[plurid-html]: https://github.com/plurid/plurid/tree/master/packages/plurid-html



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-html-server">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-html-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-html-server][plurid-html-server] • server for the HTML Custom Elements implementation

[plurid-html-server]: https://github.com/plurid/plurid/tree/master/packages/plurid-html-server -->



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-react][plurid-react] • implementation for React

[plurid-react]: https://github.com/plurid/plurid/tree/master/packages/plurid-react



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react-server">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-react-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-react-server][plurid-react-server] • server for the React implementation

[plurid-react-server]: https://github.com/plurid/plurid/tree/master/packages/plurid-react-server



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-vue">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-vue.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-vue][plurid-vue] • implementation for Vue

[plurid-vue]: https://github.com/plurid/plurid/tree/master/packages/plurid-vue -->



<!-- <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-vue-ssr">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-vue-ssr.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-vue-ssr][plurid-vue-ssr] • server for the Vue implementation

[plurid-vue-ssr]: https://github.com/plurid/plurid/tree/master/packages/plurid-vue-ssr -->
