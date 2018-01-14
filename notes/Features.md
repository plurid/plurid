<link rel="stylesheet" type="text/css" href="style.css">


# Features



## Behavior

+ Double-clicking any `<plurid-sheet>`, `<plurid-sheet-double>` plane, or `<plurid-solid>` plane makes the plane normal to the camera and hides everything else (hidden status controlled through `<plurid-options>`). Rotation transformation brings everything back into display.

+ When clicking a `<plurid-insertion>` link the `<plurid-content>` is animated, moved and centered normal to the camera.

+ In the case of multiple `<plurid-root>`s, each can be transformed (rotation, translation, scale) separately by selecting only a specific `<plurid-root>`, or all the `<plurid-root>`s can be transformed simultaneously by selecting the `<plurid-roots>` space (hence deselecting all the individual `<plurid-root>`s);



### Options in `<plurid-options>`

+ buttons :: rotation;

+ buttons :: translation;

+ buttons :: scale;

+ button :: insert other `<plurid-root>`s on the left and right of the main `<plurid-root>`, each 3D transformable on it's own;

+ more -> slider :: sensitivity of translation, rotation, and scale;

+ more -> color-picker :: `<plurid-container>` background color changer;

+ more -> color-picker :: color theme for `<plurid-bridge>` (dynamic option to use the dominant color of the web page it has in the `<plurid-scion>`);

+ more -> checkmark :: clicking/tapping a `<plurid-insertion>` link transforms the targetted `<plurid-content>` to the normal view (default on);

+ more -> slider :: opacity of the `plurid` parent after clicking/tapping on a `<plurid-insertion>` link (5–100%, default 80%) [rotation brings it back to 100%];

+ more -> slider :: opacity of everything else after double-clicking/tapping on a `<plurid-content>` (5–100%, default 80%) [rotation brings it back to 100%];

+ more -> checkmark :: use scroll without modifier to translate;

+ more -> list of modifiable shortcuts;



### Controls in `<plurid-controls>`

+ button :: bring the parent `plurid` to normal view;

+ button :: minimize the current `<plurid-sheet>` plane;

+ button :: reduce height of the current `<plurid-sheet>` plane to the current height of the viewport;

+ button :: reload the current `<plurid-sheet>` plane;

+ button :: extend the `<plurid-bridge>`;

+ button :: close the current `<plurid-sheet>` plane;

+ button :: isolate the current `<plurid-branch>`;

+ input :: URL of the current `<plurid-branch>`;

+ button :: extract the current `<plurid-branch>` to a separate `<plurid-root>`;

+ slider :: opacity of the current `<plurid-branch>` (lower-limited to 3%);

+ more -> button :: open the current `<plurid-branch>` in new tab;

+ more -> button :: flip the `<plurid-branch>` to the other side of the `<plurid-insertion>`;

+ more -> button :: flip the content to the other side (revert content in the case of `<plurid-sheet-double>`, unusable in case of `<plurid-solid>`);

+ more -> button :: opaque back (in case of `<plurid-sheet>`);

+ more -> slider :: angle to the parent `plurid` (default 90 degrees);

+ more -> button :: reset to default;

<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid.js/master/notes/Images/plurid-branch.png" height="500px">
</p>



## Shortcuts

+ `shift + mouse-movements (up/down, left-right)` :: rotate;

+ `shift + arrows (up/down, left-right)` :: rotate;

+ `alt/opt + mouse-movements (up/down, left-right)` :: translation;

+ `alt/opt + arrows (up/down, left-right)` :: translation;

+ `ctrl/cmd + mouse-movements (up/down)` :: scale;

+ `ctrl/cmd + arrow (up/down)` :: scale;

+ `alt/opt + p` :: bring the parent of the current `plurid` to normal view;

+ `alt/opt + m` :: minimize current `plurid`;

+ `alt/opt + h` :: reduce height of current `plurid`;

+ `alt/opt + r` :: reload current `plurid`;

+ `alt/opt + e + left-arrow/right-arrow` :: extend the `<plurid-bridge>` of the current `plurid`;

+ `alt/opt + x` :: close current `plurid`;

+ `alt/opt + i` :: isolate current `plurid`;

+ `alt/opt + b` :: back to the previous page within the same `plurid`;

+ `alt/opt + s` :: activate the `plurid` URL input;

+ `alt/opt + t` :: extract the current `plurid` to a separate `<plurid-root>`;

+ `alt/opt + n` :: open current `plurid` in new tab;

+ `alt/opt + f` :: flip the `<plurid-branch>` to the other side of the `<plurid-insertion>`;

+ `alt/opt + v` :: flip the content to the other side (revert content in the case of `<plurid-sheet-double>`, unusable in case of `<plurid-solid>`);

+ `alt/opt + 1` :: transform to normal view front plane;

+ `alt/opt + 2` :: transform to normal view right plane;

+ `alt/opt + 3` :: transform to normal view back plane;

+ `alt/opt + 4` :: transform to normal view left plane;

+ `double-click/tap` :: transform to normal view the clicked/tapped `<plurid-content>` plane;
