# Design: the look

The engine's chrome — the toolbar and its drawers, the viewcube, the minimap, the plane bars, the
page's rail, the `?` and its dialog, the origin, the guides, the marquee, the bridges, the empty
state, the debuggers — is drawn from ONE vocabulary on ONE set of tokens, the LOOK. This document is
the vocabulary and its rules; the token table and the presets are generated into
[LOOKS.md](./LOOKS.md); the knob, the slots and the primitives are in
[CONTROL_SURFACE.md](./CONTROL_SURFACE.md#the-look).

## The vocabulary

Three shapes. Every piece of chrome is made of them and nothing else.

| shape | what it is | fragment / primitive |
| --- | --- | --- |
| PILL | a control: `--plurid-control` square (32 px), `--plurid-radius`, the `--plurid-surface` fill, a 1 px `--plurid-rim`, a `--plurid-halo` ring, the `--plurid-blur` behind it, `--plurid-ink` glyphs; hover → `--plurid-surface-strong`; `data-plurid-active="true"` → the accent AS INK (the glyph or label takes the colour; a control is never filled with the accent); a two-tone focus ring (`--plurid-focus` over `--plurid-focus-halo`) | `chromePill` · `PluridPill`, `PluridIconButton` |
| PANEL | a surface: the `--plurid-surface-solid` fill, `--plurid-radius-panel`, the rim, the halo and `--plurid-shadow`; typography from `--plurid-font` / `-font-size` / `-weight` | `chromePanel` · `PluridPanel` |
| LINE | a beam, a guide, the bridge's film, the marquee: `--plurid-line` (or the accent for a guide) at the ambient opacity | `chromeLine` |

Plus a KEY (a keyboard key as the shortcuts dialog draws it: `chromeKey` · `PluridKey`), and two
behaviours every piece shares: `chromeRoot` (the typography reset) and `chromeDocked` (the fade with
the docked state, `--plurid-fade`).

## The rules

1. **No component owns a colour.** A piece of chrome reads tokens; it never writes a literal colour,
   radius, font size or opacity. The 15 radii, 13 font sizes and 10 opacities that used to be scattered
   are now `--plurid-radius` / `-radius-panel`, `-font-size` / `-small` / `-title`, and the two tiers.
2. **Tokens are the contract; presets are derived.** A look is a base of a few colours
   (`scheme`, `space`, `surface`, `ink`, `accent`, optionally the fonts, the grid and the vignette);
   `deriveLook` makes the 45 tokens from it, so the twelve presets are twelve bases, and a host that
   gives three colours gets a whole consistent look. The derivation keeps the ink on the solid surface
   at 4.5:1 or better and the accent on the space at 3:1 or better (asserted by the tests for every preset).
3. **The dual ground.** A control that sits ON a page (the rail, the `?`, a page's bar) must read over
   that page whatever its colours: the pill keeps its rim, halo and blur in every look; a light look
   inverts the fill and the ink, it never drops the rim and the halo.
4. **Two tiers.** Persistent affordances (the rail's pills, the `?`) sit at `--plurid-opacity-persistent`
   (0.85); ambient ones (bridges, beams, arrows) at `--plurid-opacity-ambient` (0.55). Hover brings
   either to 1.
5. **The engine writes tokens; the host may overwrite them.** The tokens are emitted as one scoped
   stylesheet, `[data-plurid-application="<id>"] { --plurid-…: … }`, specificity (0,1,0) on purpose:
   a host rule with a more specific selector wins. Geometry and type still come from tokens the engine
   set, so a host's global resets never reach the chrome (`chrome.spec.ts`, on two looks).
6. **Every imposition has an opt-out.** Every surface has `show`, every surface has a slot called with
   the chrome context, the whole chrome has one switch (`elements.chrome`), and the primitives are
   exported so custom chrome is cheap and matches.

## Adding a piece of chrome

- Compose it from the fragments (`internals.chrome`) or the primitives; give it `data-plurid-control`
  (a control) or `data-plurid-overlay` (a surface) so the view routes pointers and the docked fade to it.
- Read every value from a token. If a value is missing from the table, add a TOKEN (in
  `plurid-themes/source/looks/tokens.ts`, derived in `derive.ts`), not a literal.
- Add its `show` knob under `elements`, a `render*` slot with the chrome context, and a row in the
  chrome-mode table (`services/chrome`): which of `full` / `minimal` / `none` still renders it.
- Check it on two looks (`?look=paper`, `?look=noir`) and on a light page (`?siteTheme=light`), and re-take
  the baselines it changes.
