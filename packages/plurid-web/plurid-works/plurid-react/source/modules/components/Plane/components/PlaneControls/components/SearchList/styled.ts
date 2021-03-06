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
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    z-index: 9999;

    background-color: ${(props: any) => {
        return props.theme.backgroundColorDark;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowPenumbra;
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
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    li:hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorPrimary;
        }};
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
