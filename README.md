<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/docs/identity/plurid-logo.png" height="250px">
</p>

<div style="text-align:center">
    [![Build Status](https://travis-ci.org/plurid/plurid.js.svg?branch=master)](https://travis-ci.org/plurid/plurid.js)
    [![Coverage Status](https://coveralls.io/repos/github/plurid/plurid.js/badge.svg?branch=master)](https://coveralls.io/github/plurid/plurid.js?branch=master)
</div>


<div style="text-align:center">
plurid.js
</div>
=========

`plurid.js` is a MIT-licensed, open source JavaScript framework to view and use web content within a three-dimensional structure.


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

The framework compiled files are in the `plurid/` folder. Examples can be found in `test/examples/`.

For general design & architecture, features, and more: see `notes/`.


## License

[MIT](http://opensource.org/licenses/MIT)
