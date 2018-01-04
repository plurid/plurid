<link rel="stylesheet" type="text/css" href="style.css">

# Architecture
--------------

- `<plurid-container>` :: in general, contains everything on the web page and so it is preceded by `<body>` and succeded by `</body>`.

    It provides the context for 3D manipulations.

    In special cases, a webpage can have multiple `<plurid-container>`s.

    Can have the attribute `optionsless`.


- `<plurid-root>` :: main content container.

    Contains `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.

    Can have the attribute `controlsless`.


- `<plurid-branch>` :: additional content container.

    Can be inserted into the `<plurid-root>` or into another `<plurid-branch>`.

     It appears at an angle of 90 degrees from the generating plane. It can be flipped to the other side or (maybe) the angle can be changed.

    It is composed of:
    + `<plurid-insertion>` :: the insertion point/space;
    + `<plurid-bridge>` :: the connection between the two `plurid`s, can be extended for a better spatiation;
    + `<plurid-scion>` :: content container. Contains `<plurid-sheet>`, `<plurid-sheet-double>`, or `<plurid-solid>`.



## Elements
-----------

- `<plurid-sheet>` :: a plane that contains `<plurid-content>` on one side.


- `<plurid-sheet-double>` :: a plane that contains `<plurid-content>` on both sides.

    The two sides are:
    + `<plurid-front>`;
    + `<plurid-back>`.


- `<plurid-solid>` :: a group of six one-sided planes, forming a cuboid, that can contain `<plurid-content>` on each side.

    The six planes are:
    + `<plurid-front>`;
    + `<plurid-back>`;
    + `<plurid-top>`;
    + `<plurid-bottom>`;
    + `<plurid-right>`;
    + `<plurid-left>`.


- `<plurid-options>` :: container for options. Belongs to `<plurid-container>`.



- `<plurid-controls>` :: container for controls. Belongs to `<plurid-sheet>`, `<plurid-sheet-double>`, or to each of the six planes of `<plurid-solid>`.


## Anatomy of a Plurid
----------------------

<p align="center">
    <img src="https://github.com/plurid/plurid.js/blob/master/notes/Images/plurid-elements.png" height="500px">
</p>
