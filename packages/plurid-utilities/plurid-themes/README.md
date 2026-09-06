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
+ [Looks](#looks)
+ [Usage](#usage)
+ [Legacy themes](#legacy-themes)
+ [Codeophon](#codeophon)



## About

`@plurid/plurid-themes` is the LOOK of a plurid application: one vocabulary of design tokens for every
piece of engine chrome (the toolbar, the viewcube, the minimap, the plane bars, the rail, the shortcuts
dialog, the bridges and guides), twelve presets derived from one function, and the derivation itself,
so a host that gives a few colours gets a whole consistent look, and a host that wants a pixel changes
one token.

The tokens reach the page as `--plurid-*` custom properties on the application's element
(`[data-plurid-application="<id>"]`), which is how a host stylesheet overrides any of them. The full
token table is in [docs/LOOKS.md](../../../docs/LOOKS.md); the vocabulary and its rules in
[docs/DESIGN.md](../../../docs/DESIGN.md).



## Looks

A look is `{ name, base, tokens }`. The base is what a host writes; the tokens are what the chrome reads.

``` typescript
interface LookBase {
    scheme: 'dark' | 'light';
    space: string;      // the ground behind the planes
    surface: string;    // the chrome's fill
    ink: string;        // the chrome's text and glyphs
    accent: string;     // the one colour: active states, guides, links
    font?: string;
    fontMono?: string;
    grid?: boolean;     // the space's grid (on by default)
    vignette?: boolean; // a radial vignette over the space (off by default)
}
```

The twelve presets, each a base of a few colours:

| dark | light |
| --- | --- |
| `graphite` (the default) · `noir` · `slate` · `ink` · `ember` · `moss` · `plum` | `paper` · `snow` · `sand` · `mint` · `cobalt` |

``` typescript
import {
    looks,          // every preset by name
    LOOK_NAMES,
    deriveLook,     // (base, name?) => Look
    LOOK_TOKENS,    // the token table: name, property, group, description
    themeFromLook,  // the legacy Theme a look implies (the drawers' inputs, plane content)
    contrastRatio,  // and the other colour helpers: parseColor, withAlpha, mix, shiftLightness
} from '@plurid/plurid-themes';

const custom = deriveLook({ scheme: 'dark', space: '#0b1220', surface: '#111b2e', ink: '#e6edf7', accent: '#ffb454' });
custom.tokens.surfaceStrong; // derived: the surface at a stronger alpha, for hover and open states
```

The derivation keeps every preset readable: the ink on the solid surface at 4.5:1 or better, the
accent on the space at 3:1 or better (asserted by the package tests for all twelve).



## Usage

In a plurid application the look is one configuration knob, `look`, in any of three forms:

``` typescript
<PluridApplication look="paper" />                                 // a preset
<PluridApplication look={{ scheme: 'dark', space: '#000', surface: '#0b0b0d', ink: '#f2f2f2', accent: '#8ab4ff' }} />
<PluridApplication look={{ preset: 'graphite', tokens: { accent: '#ff5a5f', radius: '4px' } }} />   // a preset, a few tokens over it
```

The legacy `theme` knob still exists for the content and the drawers' inputs; it is derived from the
look unless set. A legacy theme NAME given to `look` (`'night'`, `'plurid'`, …) maps to the nearest
preset (`LEGACY_LOOKS`).



## Legacy themes

The 29 hand-written `Theme` objects (`night`, `dusk`, `dawn`, `light`, `ponton`, `jaune`, `furor`,
`plurid` and the product themes) stay exported and unchanged for hosts that read them directly with
`styled-components`. `generateTheme(type, baseColor)` is deprecated: it is now a shim over
`themeFromLook(deriveLook(...))` and goes in a later release. A colour can still be decomposed into
`hue`, `saturation`, `lightness` and `alpha` with `decomposeColor`.



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
