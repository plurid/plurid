// #region imports
    // #region libraries
    import styled, { keyframes } from 'styled-components';

    import {
        chromeControl,
        chromeRoot,
        chromeDocked,
        chromePill,
        chromePanel,
        CHROME_PILL_MARGIN,
        CHROME_OPACITY_AMBIENT,
    } from '~services/styled/chrome';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const riseIn = keyframes`
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
`;

export const StyledShortcutsBackdrop = styled.div`
    ${chromeRoot}
    position: absolute;
    inset: 0;
    z-index: ${Z_INDEX.SHORTCUTS_DIALOG};
    display: grid;
    place-items: center;
    padding: 40px;
    background-color: color-mix(in srgb, var(--plurid-space) 65%, transparent);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: ${fadeIn} 140ms ease;
`;

export const StyledShortcutsPanel = styled.div<{ theme: Theme }>`
    ${chromeRoot}
    width: 100%;
    max-width: 780px;
    max-height: 82vh;
    overflow-y: auto;
    box-sizing: border-box;
    ${chromePanel}
    padding: 26px 30px 30px;
    font-family: var(--plurid-font);
    animation: ${riseIn} 180ms cubic-bezier(0.16, 1, 0.3, 1);
`;

export const StyledShortcutsHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;

    h2 {
        margin: 0;
        font-size: var(--plurid-font-size-title);
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    span {
        font-size: var(--plurid-font-size-small);
        color: var(--plurid-ink-muted);
    }
`;

export const StyledShortcutsGroups = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px 28px;
`;

export const StyledShortcutsGroup = styled.div`
    break-inside: avoid;
`;

export const StyledShortcutsGroupTitle = styled.div`
    margin-bottom: 8px;
    font-size: var(--plurid-font-size-small);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--plurid-ink-muted);
`;

export const StyledShortcutsRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 26px;
    padding: 2px 0;
    font-size: var(--plurid-font-size);

    span.label {
        color: var(--plurid-ink-muted);
    }
`;

export const StyledShortcutsKeys = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
`;

/** The `?` trigger: the same persistent pill as the rail's buttons, at the rail's margin, bottom-left; it fades with the docked state. */
export const StyledShortcutsTrigger = styled.button<{ theme: Theme }>`
    ${chromeControl}
    ${chromePill}
    ${chromeDocked}
    position: absolute;
    bottom: ${CHROME_PILL_MARGIN}px;
    left: ${CHROME_PILL_MARGIN}px;
    z-index: ${Z_INDEX.SHORTCUTS_TRIGGER};
`;

export const StyledShortcutsKey = styled.kbd<{ theme: Theme }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 12px;
    height: 19px;
    padding: 0 6px;
    border-radius: calc(var(--plurid-radius) - 4px);
    border: 1px solid var(--plurid-rim);
    background-color: var(--plurid-surface-strong);
    box-shadow: 0 1px 0 0 var(--plurid-halo);
    font-family: var(--plurid-font-mono);
    font-size: var(--plurid-font-size-small);
    line-height: 1;
    white-space: nowrap;
`;
// #endregion module
