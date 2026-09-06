// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridMoreMenu: any = styled.div`
    position: absolute;
    bottom: 68px;
    width: 320px;
    max-height: min(60vh, 520px);
    left: 50%;
    transform: translateX(-50%);
    border-radius: var(--plurid-radius-panel);
    padding: 6px;
    font-size: var(--plurid-font-size);
    overflow: hidden;

    color: var(--plurid-ink);
    background: ${(props: any) => (props.transparentUI ? 'var(--plurid-surface)' : 'var(--plurid-surface-solid)')};
    border: 1px solid var(--plurid-rim);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
    backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
`;


export const StyledPluridMoreMenuItem: any = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    min-height: 30px;
    padding: 0 0.5rem;

    margin-bottom: ${(props: any) => {
        if (props.last) {
            return '0';
        }
        if (props.afterline) {
            return '30px';
        }
        return '10px';
    }};

    ${(props: any) => {
        if (props.afterline) {
            return `
                ::after {
                    position: absolute;
                    content: '';
                    left: 0;
                    right: 0;
                    bottom: -15px;
                    height: 1px;
                    background-color: var(--plurid-line);
                }
            `;
        }
        return '';
    }};
`;


export const StyledPluridMoreMenuScroll = styled.div`
    max-height: calc(min(60vh, 520px) - 12px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0;

    /* Hide Scrollbar */
    scrollbar-width: none; /* Firefox 64 */
    -ms-overflow-style: none; /* Internet Explorer 11 */
    ::-webkit-scrollbar { /** WebKit */
        display: none;
    }

    h5::first-child {
        margin-top: 0;
    }
`;
// #endregion module
