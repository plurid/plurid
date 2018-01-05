<link rel="stylesheet" type="text/css" href="style.css">


# Features


## Camera

+ Double-clicking any `<plurid-sheet>`, `<plurid-sheet-double>`, `<plurid-solid>` makes the plane normal to the camera and hides everything else. Transforming (translation/rotation/scale) brings everything back into display.

+ When clicking a `<plurid-insertion>` link the `<plurid-content>` is animated, moved and centered normal to the camera.



## Options

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

The `<plurid-controls>` are:

+ button: back to the parent plurid;

+ button: close the current `<plurid-branch>`;

+ button: extend the `<plurid-bridge>`;

+ button: isolate the current `<plurid-branch>`;

+ input: URL of the current `<plurid-branch>`;

+ button: open the current `<plurid-branch>` in new tab;

+ opacity slider (lower-limited to 3%);

+ button: flip the `<plurid-branch>` to the other side of the `<plurid-insertion>`;

+ button: flip the content to the other side (revert content in the case of `<plurid-sheet-double>`, unusable in case of `<plurid-solid>`);

+ button: opaque back (in case of `<plurid-sheet>`);

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/plurid-branch.png" height="500px">
</p>




## Shortcuts

+ `shift + mouse-movements (up/down, left-right)` :: rotate;

+ `alt/opt + mouse-movements (up/down, left-right)` :: translation;

+ `ctrl/cmd + mouse-movements (up/down)` :: scale;

+ `alt/opt + i` :: isolate current plurid;

+ `alt/opt + x` :: close current plurid;

+ `alt/opt + n` :: open current plurid in new tab;

+ `ctrl/cmd + 1` :: transform to center on front plane;

+ `ctrl/cmd + 2` :: transform to center on right plane;

+ `ctrl/cmd + 3` :: transform to center on back plane;

+ `ctrl/cmd + 4` :: transform to center on left plane;

+ `double-click/tap` :: transform to center on the clicked/tapped plane;
