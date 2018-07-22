<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/docs/identity/plurid-logo.png" height="250px">
    <br />
    <a href="https://travis-ci.org/plurid/plurid.js"><img src="https://travis-ci.org/plurid/plurid.js.svg?branch=master" alt="Build"></a>
    <a href="https://coveralls.io/github/plurid/plurid.js?branch=master"><img src="https://coveralls.io/repos/github/plurid/plurid.js/badge.svg?branch=master" alt="Coverage"></a>
</p>


<h1 align="center">
    plurid.js
</h1>

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

The framework compiled files are in the `plurid` folder. Examples can be found in `test/examples`.

For general design & architecture, features, and more: see `notes`.


## License

[MIT](http://opensource.org/licenses/MIT)
