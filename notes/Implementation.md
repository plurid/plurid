<link rel="stylesheet" type="text/css" href="style.css">


# Implementation


## `git commit` sufixes

+ Dev :: initial development;

+ Feat :: feature polishing;

+ Refact :: refactoring;

+ Fix :: bugs and their fixes;

+ Note :: clarification;

+ Docs :: documentation;

+ Setup :: system enclosure;

+ Test :: testing;

---

## TODOs

### Transformations

+ smooth transforms;

+ 6 DOF (desktop + gamepad);


### Link Insertion

+ encapsulation (shadow DOM?) for styles and scripts (also run the scripts);


### Sheet Controls

+ select :: doubleclick sets view to normal on sheet;

+ parent :: set view to normal on sheet's parent;

+ isolate;

+ back/forward, sheet history;

+ extract root

+ more section

+ tooltips for icons;


---


## Bugs

### Sheet Controls

+ select :: deselects the selected <plurid-root> when clicking, even if clicked on itself;

+ minimize :: when closing and opening the controls a bit of sheet is left due to inline styling, and also cannot switch from minimize on to reduce on;

+ reduce :: when reduced and clicking links, turning off reduce hides the new branches. The best solution would be to have `overflow: hidden` working when in reduced state and display only the "in-view" links, hiding as scrolling past them;

+ reload :: some issues due to the fact that the history of the plurid-sheet is not set (reloads a page "test" when in the search input box is "test");

+ extends :: extend at 0, close to the parent, and have it stop there, but also moveable from there; live-update of branch positions as sheet is moved (bridge extended)

+ close :: when closing a sheet and it's branches, to also remove entry from the global pluridScene

+ search :: lots of issues, error handling mostly, due to the web's complex nature;

+ opacity :: not able to input a specific number, e.g. 23;

+ misalignment of plurid-open-close sign when closed;



---

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
