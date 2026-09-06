// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridSearchList = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 47px;
    border-bottom-left-radius: var(--plurid-radius-panel);
    border-bottom-right-radius: var(--plurid-radius-panel);
    z-index: 9999;

    background-color: ${(props: any) => {
        return 'var(--plurid-surface-solid)';
    }};
    box-shadow: ${(props: any) => {
        return 'var(--plurid-shadow)';
    }};

    ul {
        padding: 0;
        margin: 0;
        list-style: none;
    }

    li {
        padding: 0.7rem 1.4rem;
        cursor: pointer;
    }

    li:last-child {
        border-bottom-left-radius: var(--plurid-radius-panel);
        border-bottom-right-radius: var(--plurid-radius-panel);
    }

    li:hover {
        background-color: var(--plurid-hover);
    }
`;


export const StyledSearchFilters = styled.div`
    display: grid;
    padding: 0.7rem;
    grid-template-columns: 1fr 1fr 1fr;
    place-content: center;
    justify-items: center;
`;
// #endregion module
