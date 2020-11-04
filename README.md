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


<h3 align="center">
    explore information as a 3D structure
</h3>



The monorepository contains packages implementing the `plurid'` technology to transform information into a 3D explorable structure based on the [plurid specification](https://github.com/plurid/plurid/tree/master/packages/plurid-specification).

With `plurid'`, a grouping of related information (such as a web page, or a fragment of one) can now reside on a `plane of content` (a `Plurid Plane`) in a three-dimensional space (a `Plurid Space`).

The content of one `Plurid Plane` can be linked to another through the `Plurid Link` which at action (click, tap, hover) effectively generates a new `plane of content` in the same space.

The `Plurid Space` can be transformed, rotated, scaled, translated, in order to get a better grasp of the contextual links of the displayed information (text, images, videos, and so forth).

`plurid'` is being used extensively in the <a target="_blank" href="https://plurid.com/products">`plurid' ∂products`</a>.

New applications leveraging the `plurid'` technology can be easily generated through the [`plurid.app`](https://plurid.app/assembler) assembler or [programatically](#plurid-application).


<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-demo.png" height="600px">
</p>



## Plurid' Application

To generate a `plurid'` web application programatically use the `Command-Line Interface` tool `@plurid/generate-plurid-app` (provided the [`NodeJS`](https://nodejs.org/en/) runtime is installed on the machine) by running the command

``` bash
npx @plurid/generate-plurid-app
```

or install the `Command-Line Interface` tool `@plurid/plurid-cli`

``` bash
npm install -g @plurid/plurid-cli
```

and run

```
plurid generate
```

<p align="center">
    <a target="_blank" href="https://youtu.be/aV7MWFDVFkk">
        <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/demo/plurid-app-generate.png" height="600px">
    </a>
</p>

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/diagrams/plurid-generate.png" height="600px">
</p>

The generated `plurid'` web application, or any other [configured](https://manual.plurid.com/plurid-app/deploy) web application, can be easily deployed to [`plurid.app`](https://plurid.app) using the [`plurid-cli`][plurid-cli] by simply runnning

``` bash
plurid deploy
```



## Packages


[@plurid/plurid-specification][plurid-specification] • `plurid'` specification

[plurid-specification]: https://github.com/plurid/plurid/tree/master/packages/plurid-specification


### Generate

<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-cli">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-cli.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-cli][plurid-cli] • `plurid'` application life-cycle management: generation, development, deployment

[plurid-cli]: https://github.com/plurid/plurid/tree/master/packages/plurid-cli



<a target="_blank" href="https://www.npmjs.com/package/@plurid/generate-plurid-app">
    <img src="https://img.shields.io/npm/v/@plurid/generate-plurid-app.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/generate-plurid-app][generate-plurid-app] • generate a `plurid'` application with one command (and some choices)

[generate-plurid-app]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/generate-plurid-app



### Shared


#### Web

<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-data">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-data.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-data][plurid-data] • constants, enumerations, interfaces

[plurid-data]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-data



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-engine">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-engine.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-engine][plurid-engine] • 3D and utility functions

[plurid-engine]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-engine



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-pubsub">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-pubsub.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-pubsub][plurid-pubsub] • publish/subscribe message bus

[plurid-pubsub]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-pubsub



### Implementations


<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-html">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-html.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-html][plurid-html] • implementation for `HTML` Custom Elements

[plurid-html]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-html



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-react][plurid-react] • implementation for `React`

[plurid-react]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-react



<a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react-server">
    <img src="https://img.shields.io/npm/v/@plurid/plurid-react-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/plurid-react-server][plurid-react-server] • server for the `React` implementation

[plurid-react-server]: https://github.com/plurid/plurid/tree/master/packages/plurid/web/plurid-react-server
