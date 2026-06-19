// #region imports
    // #region libraries
    import styled, { keyframes } from 'styled-components';

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
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: grid;
    place-items: center;
    padding: 40px;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: ${fadeIn} 140ms ease;
`;

export const StyledShortcutsPanel = styled.div<{ theme: Theme }>`
    width: 100%;
    max-width: 780px;
    max-height: 82vh;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 26px 30px 30px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background-color: ${({ theme }) => theme.backgroundColorSecondary};
    color: ${({ theme }) => theme.colorPrimary};
    box-shadow: ${({ theme }) => theme.boxShadowUmbra};
    font-family: ${({ theme }) => theme.fontFamilySansSerif};
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
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    span {
        font-size: 11px;
        opacity: 0.45;
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
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.42;
`;

export const StyledShortcutsRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 26px;
    padding: 2px 0;
    font-size: 12.5px;

    span.label {
        opacity: 0.78;
    }
`;

export const StyledShortcutsKeys = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
`;

export const StyledShortcutsTrigger = styled.button<{ theme: Theme }>`
    position: fixed;
    bottom: 18px;
    left: 18px;
    z-index: 10000;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: ${({ theme }) => theme.backgroundColorSecondary};
    color: ${({ theme }) => theme.colorPrimary};
    font-family: ${({ theme }) => theme.fontFamilySansSerif};
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease;

    &:hover {
        opacity: 1;
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.boxShadowUmbra};
    }
`;

export const StyledShortcutsKey = styled.kbd<{ theme: Theme }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 12px;
    height: 19px;
    padding: 0 6px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: ${({ theme }) => theme.backgroundColorTertiary};
    box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.25);
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 10.5px;
    line-height: 1;
    white-space: nowrap;
`;
// #endregion module
