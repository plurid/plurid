<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/docs/identity/plurid-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/plurid">
        <img src="https://img.shields.io/npm/v/plurid.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://travis-ci.org/plurid/plurid">
        <img src="https://img.shields.io/travis/plurid/plurid.svg?logo=travis&colorB=1380C3&style=for-the-badge" alt="Build Status">
    </a>
    <a target="_blank" href="https://coveralls.io/github/plurid/plurid?branch=master">
        <img src="https://img.shields.io/coveralls/github/plurid/plurid/master.svg?colorB=1380C3&style=for-the-badge" alt="Coverage Status">
    </a>
    <a target="_blank" href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    plurid
</h1>


`plurid` is a MIT-licensed, open source JavaScript framework to view and use web content within a three-dimensional structure.



## Use

Place the `plurid` folder at the same level with a `.html` file,

import the `.css` file in the `<head>` of the `.html` document,

    <link rel="stylesheet" href="./plurid/css/plurid.css">

import the `.js` file at the end of the `<body>`, before any other script,

    <script src="./plurid/js/plurid.js"></script>

place the content of the web page in a `<plurid-page>` tag, inside the `<body>`

    <plurid-page>
        <div>
            The content of the web page
        </div>
    </plurid-page>


## Description

The framework compiled files are in the `plurid` folder. Examples can be found in `test/examples`.

For general design & architecture, features, and more: see `notes`.


## License

[MIT](http://opensource.org/licenses/MIT)
