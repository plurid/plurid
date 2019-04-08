<link rel="stylesheet" type="text/css" href="style.css">

# Architecture


    <body>
        --- <plurid-container>
        |   --- <plurid-roots>
        |   |   --- <plurid-root>                           // 1st root
        |   |   |   --- <plurid-sheet>                      // original content
        |   |   |   |   +- <div>                            // <div> containing <plurid-link>s
        |   |   |   |--                                     // to the 1st and 2nd branch
        |   |   |   --- <plurid-branch>                     // 1st branch
        |   |   |   |   --- <plurid-bridge>
        |   |   |   |   --- <plurid-scion>
        |   |   |   |   |   --- <plurid-sheet>
        |   |   |   |   |   |   +-- <plurid-content>        // content received from the
        |   |   |   |   |   |                               // page attribute of the <plurid-link>
        |   |   |   |   |   |   +-- <plurid-controls>
        |   |   |   |   |   |--
        |   |   |   |   |--
        |   |   |   |--
        |   |   |   +-- <plurid-branch>                     // 2nd branch
        |   |   |--
        |   |   +-- <plurid-root>                           // 2nd root
        |   |--
        |   +-- <plurid-options>
        |--
        +-- <script>
    </body>

- `<plurid-container>` :: in general, contains everything on the web page and so it is a direct and possibly the only child of `<body>`, except `<script>`(s).

    It has the children elements `<plurid-roots>` and `<plurid-options>`.

    It provides the context for 3D transformations (rotation, translation, scale).

    In special cases, a web page can have multiple `<plurid-container>`s.

    It can have the attribute `optionsless`, removing the child element `<plurid-options>`.


- `<plurid-roots>` :: contains one or more `<plurid-root>`s.

    It can be transformed (rotation, translation, scale) by itself, transforming all the `<plurid-root>`s it contains.


- `<plurid-root>` :: content container.

    It can have the child elements `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.

    Each `<plurid-root>` can be transformed (rotation, translation, scale) independently, or by transforming the `<plurid-roots>` parent container.


- `<plurid-branch>` :: additional content container.

    It is connected with a `<plurid-link>` or an `<a>` tag inside the `<plurid-root>`'s `<plurid-sheet>` or inside the `<plurid-root>`'s other `<plurid-branch>`.

    It is inserted into the `<plurid-root>` as last child, containing the contents of the webpage from the `page` or `href` attribute of the `<plurid-link>` or `<a>` tag respectively.

    It appears at an angle of 90 degrees from the generating plane (default). It can be flipped to the other side or the angle can be changed, extracted as a `<plurid-root>`, and more.

    If the `page` or `href` attribute of the `<plurid-link>` or `<a>` tag respectively link to a webpage that has more than one `<plurid-page>` tags, then each `<plurid-page>` is imported into it's own `<plurid-scion>` and displayed side by side.

    It contains:
    + `<plurid-bridge>` :: the connection between the two `plurid`s, can be extended for a better spatiation;
    + `<plurid-scion>` :: content container. It contains `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.



## Elements

- `<plurid-sheet>` :: a plane that contains `<plurid-content>` on one side.

    It can have the attributes: `controlsless`, `unresizable`.


- `<plurid-sheet-double>` :: a plane that contains `<plurid-content>` on both sides.

    The two sides are:
    + `<plurid-sheet-double-front>`;
    + `<plurid-sheet-double-back>`.

    Each can have the attributes: `controlsless`, `unresizable`.


- `<plurid-solid>` :: a group of six one-sided planes, forming a cuboid, that can each contain `<plurid-content>`.

    The six planes are:
    + `<plurid-solid-front>`;
    + `<plurid-solid-back>`;
    + `<plurid-solid-top>`;
    + `<plurid-solid-bottom>`;
    + `<plurid-solid-right>`;
    + `<plurid-solid-left>`.

    Each can have the attributes: `controlsless`, `unresizable`.


- `<plurid-options>` :: container for options. Belongs to `<plurid-container>` and affects everything in the `<plurid-container>`. It is automatically injected at render time.


- `<plurid-controls>` :: container for controls. Belongs to each `<plurid-sheet>`, each plane of the `<plurid-sheet-double>`, or to each of the six planes of the `<plurid-solid>`. It is automatically injected at render time.


## Anatomy of a Plurid

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/about/notes/Images/plurid-elements.png" height="500px">
</p>
