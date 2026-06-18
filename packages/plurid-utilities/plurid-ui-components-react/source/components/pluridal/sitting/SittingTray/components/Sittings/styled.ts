// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledSittings: any = styled.div`
    padding: 7px;

    display: grid;
    align-items: center;

    svg {
        height: 18px;
        width: 18px;
        color: white;
        fill: white;
        user-select: none;
        cursor: pointer;
    }

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;
// #endregion module
