<link rel="stylesheet" type="text/css" href="style.css">


# Features
----------


## Camera
---------

+ Double-clicking any `<plurid-sheet>`, `<plurid-sheet-double>`, `<plurid-solid>` makes the plane normal to the camera and hides everything else. Transforming (translation/rotation/scale) brings everything back into display.

+ When clicking a `<plurid-insertion>` link the `<plurid-content>` is animated, moved and centered normal to the camera.



## Options
----------

The `<plurid-options>` are:

+ buttons: rotation;

+ buttons: translation;

+ buttons: scale;

+ translation/rotation/scale sensitivity slider;

+ button: background color changer;

+ checkmark: use scroll to translate;

+ checkmark: clicking a `<plurid-insertion>` link transforms the targetted `<plurid-content>`

+ checkmark: when clicking a `<plurid-insertion>` link or double-clicking any plurid structure everything else has opacity reduced to 0%.

+ list of (modifiable?) shortcuts;

+ ? button: insert other plurid-roots on the left and right of the main `<plurid-root>`, each 3D transformable on it's own;


## Controls
-----------

The `<plurid-controls>` are:

+ button: move camera back to the parent plurid;

+ button: isolate the current plurid (ctrl/cmd + i);

+ button: close the current plurid (x);

+ button: open the current plurid in new tab;

+ button: extend the `<plurid-bridge>`;

+ button: flip the branch to the other side of the insertion plurid;

+ button: flip the content on the other side (revert content in the case of `<plurid-sheet-double>`, unusable in case of `<plurid-solid>`);

+ button: opaque back (in case of `<plurid-sheet>`);

+ opacity slider lower-limited to 3%;

+ url input (with the link to the current page);
