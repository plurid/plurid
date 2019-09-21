<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/plurid-spec/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    plurid' specification
</h1>


Specification to transform web documents into a 3D explorable structure. Implemented in the open sourced JavaScript/CSS framework [`plurid`](https://github.com/plurid/plurid).


+ [Scope](#scope)
+ [Use](#use)
+ [Description](#description)



## Scope

To generate a three-dimensional space within the browser where each page is a plane of content and transform the Internet navigation experience into an exploration.

<div align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/packages/plurid-spec/docs/images/plurid-demo.png" height="600px">
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
