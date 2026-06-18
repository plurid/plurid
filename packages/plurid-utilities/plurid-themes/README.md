<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-themes">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-themes.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid-themes/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' themes
</h1>


<h3 align="center">
    Themes for Plurid Applications
</h3>



<br />



### Contents

+ [About](#about)
+ [Demo](#demo)
+ [Usage](#usage)
+ [Codeophon](#codeophon)



## About

There are four shade-oriented base themes, three color-oriented base themes, and multiple `plurid`-oriented product themes.

The four shade-oriented base themes consist of:

+ `night`
+ `dusk`
+ `dawn`
+ `light`

where the lightness increases from the `night` to `light`,

and the three color-oriented base themes are:

+ `ponton` - blue-based
+ `jaune` - yellow-based
+ `furor` - red-based.

The four shade-oriented base themes are inspired by [radical-style-interfaces](https://github.com/plurid/radical-style-interfaces).

A theme can be further more classified based on the theme `type` (`dark` or `bright`). A `dark` theme will have the primary color darker than the secondary color, whereas a `bright` theme will have the primary color brighter than the secondary color.



## [Demo](https://meta.plurid.com/themes)



## Usage

The themes are intended to be used for `CSS-in-JS` styling along with `react`, `styled-components`, or other packages.

``` typescript
interface Theme {
    type: "dark" | "bright";
    name: "generated"
        | "night" | "dusk" | "dawn" | "light"
        | "ponton" | "jaune" | "furor"
        | "plurid"
        | "deback" | "decode" | "defile" | "deleaf"
        | "delook" | "deloss" | "demail" | "denote"
        | "depack" | "depict" | "deself" | "desite"
        | "detime" | "detour" | "detune" | "deturn"
        | "deveil" | "devert" | "deview" | "dewiki";

    baseColor: string;
    baseColorInverted: string;

    backgroundColorDark: string;
    backgroundColorBright: string;

    backgroundColorPrimary: string;
    backgroundColorPrimaryAlpha: string;
    backgroundColorPrimaryInverted: string;

    backgroundColorSecondary: string;
    backgroundColorSecondaryAlpha: string;
    backgroundColorSecondaryInverted: string;

    backgroundColorTertiary: string;
    backgroundColorTertiaryAlpha: string;
    backgroundColorTertiaryInverted: string;

    backgroundColorQuaternary: string;
    backgroundColorQuaternaryAlpha: string;
    backgroundColorQuaternaryInverted: string;


    colorPrimary: string;
    colorPrimaryInverted: string;

    colorSecondary: string;
    colorSecondaryInverted: string;

    colorTertiary: string;
    colorTertiaryInverted: string;


    boxShadowUmbra: string;
    boxShadowUmbraColor: string;
    boxShadowUmbraInset: string;

    boxShadowPenumbra: string;
    boxShadowPenumbraColor: string;
    boxShadowPenumbraInset: string;

    boxShadowAntumbra: string;
    boxShadowAntumbraColor: string;
    boxShadowAntumbraInset: string;

    fontFamilySansSerif: string;
    fontFamilySerif: string;
    fontFamilyMonospace: string;
}
```

A color can be decomposed into it's constituents (`hue`, `saturation`, `lightness`, `alpha`) using the `decomposeColor` utility function.



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
