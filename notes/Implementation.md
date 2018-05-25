<link rel="stylesheet" type="text/css" href="style.css">


# Implementation


### `git commit` sufixes

+ Dev :: initial development;
+ Feat :: feature polishing;
+ Refact :: refactoring;
+ Fix :: bugs and their fixes;
+ Note :: clarification, documentation;
+ Setup :: system enclosure;
+ Test :: testing;


## TODOs

+ when using reduce height apply the CSS rule "overflow: overlay;"

+ tooltips for icons in plurid controls



## Bugs



## Ideas

### Linkings

To be able to link pages like this

    // main.html
    <plurid-page>
        Words <plurid-link page="water"></plurid-link>
    </plurid-page>

    <plurid-page title="water">
        Water
    </plurid-page>

but also

    // main.html
    <plurid-page>
        Words <a href="/water">water</a>
    </plurid-page>

    // water.html
    <plurid-page title="water">
        Water
    </plurid-page>
