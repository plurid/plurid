<link rel="stylesheet" type="text/css" href="style.css">

# Use

Place the `plurid` folder at the same level with a `.html` file,

<br>

import the `.css` file in the `<head>` of the `.html` document,

    <link rel="stylesheet" href="./plurid/css/plurid.css">

<br>

import the `.js` file at the end of the `<body>`, before any other script,

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
    --- simple-page
    |   --- plurid
    |   |   --- css
    |   |   |   --- plurid.css
    |   |   |--
    |   |   --- js
    |   |   |   --- plurid.js
    |   |   |--
    |   |--
    |   --- index.html
    |---

<br>

### Page Example

    /-- simple-page/index.html
    <html>
        <head>
            <title>Plurid Page Example</title>
            <link rel="stylesheet" href="./plurid/css/plurid.css">
        </head>

        <body>
            <plurid-page>
                <div>
                    The content of a simple web page
                </div>
            </plurid-page>

            <script src="./plurid/js/plurid.js"></script>
        </body>
    </html>

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/Use/simple-page.png" height="500px">
</p>

<br>

### Linking

In order to create a three-dimensional link, add a `plurid-link`

    /-- linked-page/index.html
    <div>
        The content of the web page with a <plurid-link page="/path/to/another-document.html">link</plurid-link>
    </div>

The `page` attribute can be used as a `href` to link to an external document on the same domain (due to CORS) or can be used to link to a `plurid-page` in the same document.

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/Use/linked-page-initial.png" height="500px">
</p>

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/Use/linked-page-rotated.png" height="500px">
</p>

<br>

### Same Document Linked-Page

To link to a `plurid-page` in the same document, the linked page must be named

    <plurid-page name="nameOfPage">
        Content of the linked page
    </plurid-page>

and the `<plurid-link>` will be

    <plurid-link page="nameOfPage">link</plurid-link>

therefore, the `<body>` of `index.html` might look like

    /-- same-document-linked-page/index.html
    <body>
        <plurid-page>
            <div>
                The content of the page with <plurid-link page="nameOfPage">link</plurid-link>
            </div>
        </plurid-page>

        <plurid-page name="nameOfPage">
            Content of the linked page
        </plurid-page>

        <script src="./plurid/js/plurid.js"></script>
    </body>

If the linked, named page has an attribute `open` then the document will load with the initial `<plurid-page>` linking the named `<plurid-page>` and having the link as-if already activated. If the attribute `open` is set to `false` or if not set, then the linked, named page will be viewed only when clicking, and therefore activating, the link.

If the `<plurid-link>` has the attribute `samepage` then the link will be followed within the current page sheet.

<br>

### Same Document Multi-Page

A document can have multiple `<plurid-page>`s independent of each other (not linked between them). In such a case the pages will be rendered one near another, based on the order of the document. The gap between pages can be modified from the global JavaScript object `pluridScene` > `pluridscene.metadata.multiPageGap` :: number.

    /-- index.html
    <body>
        <plurid-page>
            First page
        </plurid-page>

        <plurid-page>
            Second page
        </plurid-page>

        <plurid-page>
            Third page
        </plurid-page>
    </body>

<br>

A `<plurid-page>` can have a position specified

    <plurid-page position="transX, transY, transZ, rotX, rotY, rotZ, scale">
        Page positioned
    </plurid-page>

Instead of specifying number values to position, e.g. `position="200, -350, 450, 0, 50, 0, 1"` (`"px, px, px, deg, deg, deg, scalar"`), a single number can be passed, indicating order, e.g. `position="3"`,

    /-- index.html
    <body>
        <plurid-page position="3">
            Third page
        </plurid-page>

        <plurid-page>
            First page
        </plurid-page>

        <plurid-page>
            Fourth page
        </plurid-page>

        <plurid-page position="2">
            Second page
        </plurid-page>
    </body>

(in this case, the first `<plurid-page>` in document order will be the 3rd and last the 2nd, while the unspecified `<plurid-page>`s will be placed as 1st and 4th respectively.)

or

instead of crisp numbers resolving to pixel values, the value of `position` can be set to dynamically adjust, e.g. `position="screen, -350, 450, 0, 50, 0, 1"`, where `screen` will resolve to the current value of the viewing window in pixels.

Additionally, position can receive a short-hand value, e.g. `position="touchleft, 30deg, 0px"`, indicating that the `<plurid-page>` will be positioned to the left of the previous `<plurid-page>`, in the document order, touching its left margin (with the right margin) at a `0px` gap and rotated at 30 degrees on the Y axis. The options are `left`, `right`, `touchleft`, and `touchright`.

A cube (without top and bottom faces) can be formed by 4 `<plurid-page>`s rotated at 90 degrees relative to another.

    <plurid-page position="1">
    <plurid-page position="touchright, 90deg, 0px">
    <plurid-page position="touchright, 90deg, 0px">
    <plurid-page position="touchright, 90deg, 0px">


---

The `plurid` folder contains:
+ css
    + plurid.css (minified, production-ready)


+ js
    + plurid.js (minified, production-ready)


---


+ `plurid.css` gathers the styles;

+ `plurid.js` gathers the behavior and the templates for `<plurid-options>` and `<plurid-controls>` and others;
