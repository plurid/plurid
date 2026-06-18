// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledStateLink = styled.div`
    padding: 7px;
    padding-bottom: 0px;
    margin-bottom: 4px;
`;


export const StyledStateLinkContainer: any = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    height: 25px;
    align-items: center;
`;


export const StyledStateLinkText: any = styled.div`
    width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
    user-select: all;
    text-align: left;

    scrollbar-width: none;
    ::-webkit-scrollbar {
        display: none;
    }
`;


export const StyledStateLinkCopy: any = styled.div`
    width: 100%;
    cursor: pointer;
    justify-self: center;
`;
// #endregion module
