// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledStateLine = styled.div`
    padding: 0 7px;
    margin-bottom: 4px;

    display: grid;
    align-items: center;
    justify-items: center;

    svg {
        height: 18px;
        width: 18px;
        color: white;
        fill: white;
        user-select: none;
        cursor: pointer;
    }
`;

export const StyledSliderStateButton = styled.div`
    user-select: none;
    cursor: pointer;
    display: grid;
    place-content: center;
`;

export const StyledSliderStateSliderContainer = styled.div`
`;


export const StyledSliderStateSittings = styled.div`
    justify-self: center;
`;


export const StyledStateLineButtons = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 20px);
    grid-gap: 3px;
    align-items: center;
    justify-content: right;
`;

export const StyledStateLineButton = styled.div`
    display: grid;
    place-content: center;
`;


export const StyledStateLineContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-content: space-between;
`;
// #endregion module
