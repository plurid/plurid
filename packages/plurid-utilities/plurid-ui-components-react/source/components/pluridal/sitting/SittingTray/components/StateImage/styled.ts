// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledStateImage = styled.div`
    padding: 0 7px;
    margin-bottom: 4px;

    svg {
        height: 18px;
        width: 18px;
        color: white;
        fill: white;
        user-select: none;
        cursor: pointer;
    }
`;


export const StyledStateShareImage = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 25px;
    align-items: center;
`;


export const StyledStateShareImageButtons = styled.div`
    display: grid;
    grid-template-columns: 110px auto;
    align-items: center;
    justify-items: center;
    height: 25px;
`;


export const StyledStateShareImageButtonsCopy = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
    justify-self: left;

    svg {
        height: 18px;
        width: 18px;
        fill: white;
    }
`;


export const StyledStateShareImagePasteContainer = styled.div`
    display: grid;
    grid-template-columns: 100px 40px;
    align-items: center;
    justify-items: center;

    input {
        width: 100%;
        outline: none;
        border: none;
        background: hsla(0, 0%, 10%, 0.5);
        color: white;
        padding: 6px;
    }
`;
// #endregion module
