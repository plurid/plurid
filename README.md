<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/p-plurid-black-1000x1000.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>


<h1 align="center">
    plurid'
</h1>


Transform web documents into a 3D explorable structure


The monorepository contains packages implementing the `plurid'` technology to create a 3D browser view based on the [plurid-specification](https://github.com/plurid/plurid-spec).


<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-demo.png" height="600px">
</p>


## Plurid Application

To generate a `plurid'` application the CLI tool `@plurid/generate-plurid-app` can be used

```
npx @plurid/generate-plurid-app
```

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/diagrams/plurid-generate.png" height="600px">
</p>


## Packages

@plurid/generate-plurid-app - create plurid application with one command

@plurid/plurid-engine - 3D utility functions

@plurid/plurid-html - HTML Custom Elements implementation

@plurid/plurid-html-ssr - HTML Custom Elements implementation with Server-Side Rendering

@plurid/plurid-react - React implementation

@plurid/plurid-react-ssr - React implementation with Server-Side Rendering

@plurid/plurid-renderer - rendering engine

@plurid/plurid-scripts - build/development utility functions

@plurid/plurid-server - server for server-side rendering and application serving

@plurid/plurid-state - state management for a plurid application

@plurid/plurid-vue - Vue implementation

@plurid/plurid-vue-ssr - Vue implementation with Server-Side Rendering
