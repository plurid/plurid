<link rel="stylesheet" type="text/css" href="style.css">


# Features



## Behavior

+ Double-clicking any `<plurid-sheet>`, `<plurid-sheet-double>`, `<plurid-solid>` makes the plane normal to the camera and hides everything else. Transforming (translation/rotation/scale) brings everything back into display.

+ When clicking a `<plurid-insertion>` link the `<plurid-content>` is animated, moved and centered normal to the camera.

+ To be able to detach a `<plurid-branch>` from it's current plurid parent and upgrade it to `<plurid-root>`.



## Options in `<plurid-options>`

+ buttons: rotation;

+ buttons: translation;

+ buttons: scale;

+ translation/rotation/scale sensitivity slider;

+ button: background color changer;

+ checkmark: use scroll to translate;

+ checkmark: clicking a `<plurid-insertion>` link transforms the targetted `<plurid-content>` in order to face it from the normal vector (default on);

+ checkmark: when clicking a `<plurid-insertion>` link or double-clicking any plurid structure everything else has opacity reduced to 0% (isolate mode on always) (default off);

+ checkmark: reduce opacity of the plurid parent after clicking on a `<plurid-branch>`;

+ list of (modifiable?) shortcuts;

+ button: insert other `<plurid-root>`s on the left and right of the main `<plurid-root>`, each 3D transformable on it's own (?);



## Controls in `<plurid-controls>`

+ button: back to the parent `plurid`;

+ button: minimize the current `<plurid-sheet>` plane;

+ button: reduce height of the current `<plurid-sheet>` plane to the current height of the viewport;

+ button: close the current `<plurid-sheet>` plane;

+ button: extend the `<plurid-bridge>`;

+ button: isolate the current `<plurid-branch>`;

+ input: URL of the current `<plurid-branch>`;

+ button: extract the current `<plurid-branch>` to a separate, different `<plurid-root>`;

+ opacity slider (lower-limited to 3%);

+ move -> button: open the current `<plurid-branch>` in new tab;

+ more -> button: flip the `<plurid-branch>` to the other side of the `<plurid-insertion>`;

+ more -> button: flip the content to the other side (revert content in the case of `<plurid-sheet-double>`, unusable in case of `<plurid-solid>`);

+ more -> button: opaque back (in case of `<plurid-sheet>`);

+ more -> slider for angle to the parent plurid (default 90 degrees) (?);

+ more -> button: reset to default;

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/plurid-branch.png" height="500px">
</p>



## Shortcuts

+ `shift + mouse-movements (up/down, left-right)` :: rotate;

+ `alt/opt + mouse-movements (up/down, left-right)` :: translation;

+ `ctrl/cmd + mouse-movements (up/down)` :: scale;

+ `alt/opt + i` :: isolate current `plurid`;

+ `alt/opt + m` :: minimize current `plurid`;

+ `alt/opt + x` :: close current `plurid`;

+ `alt/opt + r` :: extract the current `plurid` to a separate, different `<plurid-root>`;

+ `alt/opt + n` :: open current `plurid` in new tab;

+ `alt/opt + 1` :: transform to center on front plane;

+ `alt/opt + 2` :: transform to center on right plane;

+ `alt/opt + 3` :: transform to center on back plane;

+ `alt/opt + 4` :: transform to center on left plane;

+ `double-click/tap` :: transform to center on the clicked/tapped `plurid` plane;
