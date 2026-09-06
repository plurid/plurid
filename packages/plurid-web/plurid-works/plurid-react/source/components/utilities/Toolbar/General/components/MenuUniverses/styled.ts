// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridMenuUniverses = styled.div`
    position: absolute;
    bottom: 75px;
    max-height: 250px;
    width: 380px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 22.5px;
    padding: 22px;
    font-size: 0.8rem;
    overflow: hidden;

    background-color: ${(props: any) => {
        return 'var(--plurid-surface-solid)';
    }};
    box-shadow: ${(props: any) => {
        return 'var(--plurid-shadow)';
    }};

    ul {
        padding: 0;
        list-style: none;
    }
`;


export const StyledPluridMenuUniversesItem: any = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    margin-bottom: ${(props: any) => {
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
                    background-color: white;
                }
            `;
        }
        return '';
    }};
`;


export const StyledPluridMenuUniversesScroll = styled.div`
    max-height: 210px;
    overflow: scroll;
    padding: 0 5px;

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


export const StyledMenuUniversesItemList: any = styled.li`
    margin: 10px 0;
    padding: 10px 20px;
    border-radius: 100px;

    cursor: ${(props: any) => {
        if (props.active) {
            return 'initial';
        }
        return 'pointer';
    }};
    color: ${(props: any) => (props.active ? 'var(--plurid-accent)' : 'inherit')};

    &:hover {
        background-color: var(--plurid-hover);
    }
`;
// #endregion module
