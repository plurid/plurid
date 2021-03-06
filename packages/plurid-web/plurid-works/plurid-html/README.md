<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/docs/identity/plurid-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/plurid">
        <img src="https://img.shields.io/npm/v/plurid.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid
</h1>


`plurid` is a MIT-licensed, open source JavaScript framework to view and use web content within a three-dimensional structure.


+ [Scope](#scope)
+ [Use](#use)
    + [Manual](#manual)
    + [Package Manager](#package-manager)
+ [Description](#description)



## Scope

To generate a three-dimensional space within the browser where each page is a plane of content and transform the Internet navigation experience into an exploration.

<img src="https://raw.githubusercontent.com/plurid/plurid/master/about/docs/images/10-dawn.png" height="600px">



## Use

### Manual

Place the `pkg` folder at the same level with a `.html` file, rename the folder to `plurid`,

import the `.css` file in the `<head>` of the `.html` document,

    <link rel="stylesheet" href="./plurid/styles.css">

import the `.js` file at the end of the `<body>`, before any other script,

    <script src="./plurid/script.js"></script>

place the content of the web page in a `<plurid-page>` tag, inside the `<body>`

    <plurid-page>
        <div>
            The content of the web page
        </div>
    </plurid-page>

### Package Manager

Run the command

    npm install plurid

or

    yarn install plurid


## Description

The framework compiled files are in the `./pkg/` folder. Examples can be found in `test/examples/`.

For general design & architecture, features, and more: see `./about/notes/`.
