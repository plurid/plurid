<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/plurid-specification/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    plurid' specification
</h1>


<h3 align="center">
    Explore Information as a 3D Structure
</h3>



The specification details the manner and the general conventions regarding the transformation of displayed information into a 3D explorable structure.


The specification is implemented for

+ web
    + [`plurid-react`](https://github.com/plurid/plurid/tree/master/packages/plurid-web/plurid-react)
    + [`plurid-html`](https://github.com/plurid/plurid/tree/master/packages/plurid-web/plurid-html) - in progress
+ native
    + [`plurid-electron`](https://github.com/plurid/plurid/tree/master/packages/plurid-native/plurid-electron) - in progress
    + [`plurid-react-native`](https://github.com/plurid/plurid/tree/master/packages/plurid-native/plurid-react-native) - in progress


### Contents

+ [Scope](#scope)
+ [General Description](#general-description)



## Scope

To generate a three-dimensional space within the general information-viewing software/device (e.g., a browser) where each relevant grouping of information (e.g., a /web/page) is a plane of content and transform the information navigational experience into a 3D exploration.

<div align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/demo/plurid-com-example.png" height="600px">
</div>



## General Description

Concepts will be detailed using `HTML Custom Elements` pseudo-code.

The content of the web page will be placed in a `<plurid-plane>` tag, which is inside the `<plurid-application>`, inside the `<body>`

``` html
<body>
    <plurid-application>
        <plurid-plane>
            <div>
                The content of the web plane
            </div>
        </plurid-plane>
    <plurid-application>
</body>
```

The `<plurid-application>` will, by default, span over the full `width` and `height` of the view window, and it will provide all the context required for the transformation of the 2D window view into a 3D explorable space. The most important is the wrapping of the `<plurid-plane>`s into a `<plurid-space>`.

The `<plurid-plane>` is an entity with a certain `width` and `height` which can be configured by the application developer, or let free to be modified by the user at runtime.

The `<plurid-plane>` has a specified `route` attribute. The `route` is unique across the entire `<plurid-space>`.

A `<plurid-plane>` can contain none, one, or more `<plurid-link>`s. A `<plurid-link>` will trigger at action (click, tap, hover) a rendering of the targeted `<plurid-plane>` inside the same `<plurid-space>`. The `<plurid-link>` specifies the targeted `<plurid-plane>` through the `route` attribute.

A `<plurid-application>` has one ore more `<plurid-plane>`s in view, actually rendered in the view window, one or more `<plurid-plane>`s definitions, on the basis of which new `<plurid-planes>` will be resolved into view, and a function to resolve `<plurid-plane>`s not defined.
