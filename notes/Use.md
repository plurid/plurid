<link rel="stylesheet" type="text/css" href="style.css">

# Use

Place the `plurid` folder at the same level with a `.html` file,

<br>

import the `.css` file in the `<head>` of the `.html` document

    <link rel="stylesheet" href="./plurid/css/plurid.css">

<br>

import the `.js` file at the end of the `<body>`, before any other script

    <script src="./plurid/js/plurid.js"></script>

<br>

place the content of the web page in a `<plurid-page>` tag, inside the `<body>`

    <plurid-page>
        <div>
            The content of the web page
        </div>
    </plurid-page>

<br>


### Files Example

    .
    --- public
    |   --- plurid
    |       --- css
    |           --- plurid.css
    |       --- js
    |           --- plurid.js
    |   --- index.html


### Page Example

    <html>
        <head>
            <title>Plurid Page Example</title>
            <link rel="stylesheet" href="./plurid/css/plurid.css">
        </head>

        <body>
            <plurid-page>
                <div>
                    The content of the web page
                </div>
            </plurid-page>

            <script src="./plurid/js/plurid.js"></script>
        </body>
    </html>


### Linking

In order to create a link, add a `plurid-link`

    <div>
        The content of the web page with a <plurid-link page="/link">link</plurid-link>
    </div>

The `page` attribute can be used as an `href` to link to an external document on the same domain (due to CORS) or can be used to link to a `plurid-page` in the same document.

To link to a `plurid-page` in the same document, the linked page must be named

    <plurid-page name="nameOfPage">
        Content of the linked page
    </plurid-page>

and the link will be

    <plurid-link page="nameOfPage">link</plurid-link>


---


The `plurid` folder contains:
+ css
    + plurid.css (minified, production-ready)


+ js
    + plurid.js (minified, production-ready)


---


+ `plurid.css` gathers the styles;

+ `plurid.js` gathers the behavior and the templates for `<plurid-options>` and `<plurid-controls>` and others;
