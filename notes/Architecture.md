<link rel="stylesheet" type="text/css" href="style.css">

# Architecture

- `<plurid-container>` :: in general, contains everything on the web page and so it is a direct and possibly the only child of `<body>`.

    It provides the context for 3D transformations (rotation, translation, scale).

    In special cases, a web page can have multiple `<plurid-container>`s.

    Can have the attribute `optionsless`.


- `<plurid-roots>` :: contains one or more `<plurid-root>`s.

    Can be transformed (rotation, translation, scale) by itself, transforming all the `<plurid-root>`s it contains.


- `<plurid-root>` :: content container.

    Contains `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.

    Each `<plurid-root>` can be transformed (rotation, translation, scale) independently, or by transforming the `<plurid-roots>` parent container.


- `<plurid-branch>` :: additional content container.

    Can be inserted into the `<plurid-root>`'s `<plurid-content>` or into another `<plurid-branch>`'s `<plurid-content>`.

    It appears at an angle of 90 degrees from the generating plane. It can be flipped to the other side or the angle can be changed.

    It is composed of:
    + `<plurid-insertion>` :: the insertion point/space;
    + `<plurid-bridge>` :: the connection between the two `plurid`s, can be extended for a better spatiation;
    + `<plurid-scion>` :: content container. Contains `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.



## Elements

- `<plurid-sheet>` :: a plane that contains `<plurid-content>` on one side.

    Can have the attributes: `controlsless`, `unresizable`.


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


- `<plurid-options>` :: container for options. Belongs to `<plurid-container>` and affects everything in the `<plurid-container>`.


- `<plurid-controls>` :: container for controls. Belongs to each `<plurid-sheet>`, each plane of the `<plurid-sheet-double>`, or to each of the six planes of the `<plurid-solid>`.


## Anatomy of a Plurid

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/plurid-elements.png" height="500px">
</p>
