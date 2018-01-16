<link rel="stylesheet" type="text/css" href="style.css">

# Technology


To use plurid

place the folder `plurid` at the same level with a `.html` file,

import in the `<head>` of the `.html` document

    `<link rel="import" href="./plurid/html/plurid.html">`,

import at the end of the `<body>`

    `<script type="text/javascript" src="./plurid/js/plurid.js"></script>`,

place the content of the webpage in a `<plurid-content>` tag.


---


The `plurid` folder contains:
+ css
    + styles.css (minified)


+ html
    + plurid.html (minified)


+ js
    + plurid.js (minified)


+ images (maybe)


---


+ `styles.css` gathers the main styles;


+ `plurid.html` gathers the templates for `<plurid-options>` and `<plurid-controls>`

    (side-note > should `plurid.html` also have the `styles.css`?);


+ `plurid.js` gathers the main behavior;
