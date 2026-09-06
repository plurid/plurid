// #region imports
    // #region libraries
    import React, {
        useMemo,
    } from 'react';

    import {
        Look,
        LookTokens,
        LOOK_TOKENS,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        PLURID_ATTRIBUTE_APPLICATION,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export { PLURID_ATTRIBUTE_APPLICATION };

/** The resolved look of a configuration (identity-memoised inside the engine). */
export const lookOf = (
    configuration: PluridConfiguration,
): Look => generalEngine.look.resolveLook(configuration.global.look);

export const getLook = (
    state: AppState,
): Look => lookOf(state.configuration);

/**
 * The stylesheet a look is: every token as a `--plurid-*` custom property, scoped to one
 * application by its id — specificity (0,1,0), on purpose, so a host's stylesheet overwrites any
 * token with a more specific selector or a later rule. `docking.fade` (a configuration knob) is the
 * fade when set; `--plurid-dock-fade` stays as an alias of `--plurid-fade` for one release.
 */
export const lookStylesheet = (
    look: Look,
    applicationID: string,
    overrides: Partial<LookTokens> = {},
): string => {
    const tokens = { ...look.tokens, ...overrides };
    const lines = LOOK_TOKENS.map((token) => `    ${token.property}: ${tokens[token.name]};`);
    lines.push('    --plurid-dock-fade: var(--plurid-fade);');
    lines.push(`    color-scheme: ${tokens.scheme};`);
    const scope = `[${PLURID_ATTRIBUTE_APPLICATION}="${applicationID.replace(/["\\]/g, '\\$&')}"]`;
    return `${scope} {\n${lines.join('\n')}\n}`;
};

export interface PluridLookStyleProperties {
    look: Look;
    applicationID: string;
    /** `space.docking.fade`, ms: the fade token when the host set it */
    fade?: number;
}

/** The one `<style>` an application carries for its look; server-rendered with the rest. */
export const PluridLookStyle: React.FC<PluridLookStyleProperties> = ({
    look,
    applicationID,
    fade,
}) => {
    const css = useMemo(
        () => lookStylesheet(look, applicationID, fade !== undefined ? { fade: fade + 'ms' } : {}),
        [look, applicationID, fade],
    );
    return (
        <style
            data-plurid-look={look.name}
            dangerouslySetInnerHTML={{ __html: css }}
        />
    );
};
// #endregion module
