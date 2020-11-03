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

+ native
    + [`plurid-react-native`](https://github.com/plurid/plurid/tree/master/packages/plurid-native/plurid-react-native) - in progress
    + [`plurid-swift`](https://github.com/plurid/plurid/tree/master/packages/plurid-native/plurid-swift) - in progress
+ web
    + [`plurid-html`](https://github.com/plurid/plurid/tree/master/packages/plurid-web/plurid-html) - in progress
    + [`plurid-react`](https://github.com/plurid/plurid/tree/master/packages/plurid-web/plurid-react)



### Contents

+ [Scope](#scope)
+ [Use](#use)
+ [Description](#description)



## Scope

To generate a three-dimensional space within the general information-viewing software/device (e.g., a browser) where each relevant grouping of information (e.g., a /web/page) is a plane of content and transform the information navigational experience into a 3D exploration.

<div align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-demo.png" height="600px">
</div>



## Use

Concepts will be detailed using `HTML Custom Elements` pseudo-code.

The content of the web page will be placed in a `<plurid-page>` tag, which is inside the `<plurid-app>`, inside the `<body>`

    <body>
        <plurid-app>
            <plurid-page>
                <div>
                    The content of the web page
                </div>
            </plurid-page>
        <plurid-app>
    </body>

The `<plurid-app>` will, by default, span over the full `width` and `height` of the browser window, and it will provide all the context required for the transformation of the 2D browser window into a 3D explorable space.


## Description

For general design & architecture, features, and more: see `./about/notes/`.
