// #region imports
    // #region libraries
    import styled, { keyframes } from 'styled-components';

    import {
        chromeControl,
        chromeRoot,
        chromePanel,
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
    from { opacity: 0; transform: translateY(-6px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
`;

/** The palette's backdrop: the dialog sits near the top, where a palette is looked for. */
export const StyledPaletteBackdrop = styled.div`
    ${chromeRoot}
    position: absolute;
    inset: 0;
    z-index: ${Z_INDEX.PALETTE};
    display: grid;
    place-items: start center;
    padding: 12vh 24px 24px;
    background-color: color-mix(in srgb, var(--plurid-space) 55%, transparent);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: ${fadeIn} 120ms ease;
`;

export const StyledPalettePanel = styled.div<{ theme: Theme }>`
    ${chromeRoot}
    width: 100%;
    max-width: 620px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    ${chromePanel}
    padding: 10px;
    font-family: var(--plurid-font);
    animation: ${riseIn} 160ms cubic-bezier(0.16, 1, 0.3, 1);
`;

export const StyledPaletteInput = styled.input`
    ${chromeControl}
    width: 100%;
    box-sizing: border-box;
    /* a flex child never shrinks the field: the list below it is what gives way */
    flex: 0 0 auto;
    height: var(--plurid-control);
    padding: 0 10px;
    border: 1px solid var(--plurid-rim);
    border-radius: var(--plurid-radius);
    background-color: var(--plurid-surface);
    color: var(--plurid-ink);
    font-family: var(--plurid-font);
    font-size: var(--plurid-font-size-title);
    cursor: text;

    &::placeholder {
        color: var(--plurid-ink-faint);
    }

    /* the chrome's two-tone ring, not the browser's own */
    &:focus-visible {
        outline: 2px solid var(--plurid-focus);
        outline-offset: 1px;
        box-shadow: 0 0 0 1px var(--plurid-halo), 0 0 0 5px var(--plurid-focus-halo);
    }
`;

export const StyledPaletteList = styled.div`
    margin-top: 8px;
    /* the list is what the panel's max height cuts into */
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
`;

export const StyledPaletteGroupTitle = styled.div`
    margin: 10px 6px 4px;
    font-size: var(--plurid-font-size-small);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--plurid-ink-faint);
`;

export const StyledPaletteRow = styled.div<{ theme: Theme; selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 7px 8px;
    border-radius: calc(var(--plurid-radius) - 3px);
    cursor: pointer;
    font-size: var(--plurid-font-size);
    color: ${({ selected }) => (selected ? 'var(--plurid-ink)' : 'var(--plurid-ink-muted)')};
    background-color: ${({ selected }) => (selected ? 'var(--plurid-hover)' : 'transparent')};

    &:hover {
        background-color: var(--plurid-hover);
    }

    span.title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const StyledPaletteKeys = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
`;

export const StyledPaletteKey = styled.kbd`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 12px;
    height: 19px;
    padding: 0 6px;
    border-radius: calc(var(--plurid-radius) - 4px);
    border: 1px solid var(--plurid-rim);
    background-color: var(--plurid-surface-strong);
    font-family: var(--plurid-font-mono);
    font-size: var(--plurid-font-size-small);
    line-height: 1;
    white-space: nowrap;
`;

export const StyledPaletteEmpty = styled.div`
    padding: 18px 8px;
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size);
`;
// #endregion module
