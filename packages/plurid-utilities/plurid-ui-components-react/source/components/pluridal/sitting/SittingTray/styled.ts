// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledSittingTray: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};

    border-radius: 10px;
    position: absolute;
    left: 35px;
    width: 160px;
    /*
        -1 * (height - 40px <button>)
     */
    /* height: 95px; */
    bottom: -163px;
    /* bottom: 0; */
    overflow: hidden;
`;


export const StyledSittingTrayContainer: any = styled.div`
    overflow: auto;
    height: 100%;

    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */
    ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
    }

    li {
        min-height: 26px;
        /* padding: 0 7px;
        margin: 7px 0; */
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
    }

    h4 {
        margin: 0;
    }
`;


export const StyledSittingTrayItem: any = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    align-items: center;
`;


export const StyledSittingTrayItemHeader: any = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
`;


export const StyledSittingTrayItemBody: any = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
`;


export const StyledSittingTrayButton: any = styled.div`
    display: grid;
    grid-template-columns: 25px 1fr;
    cursor: pointer;
`;


export const StyledSittingTrayButtonIcon: any = styled.div`
`;


export const StyledSittingTrayButtonText: any = styled.div`
    display: flex;
    align-items: center;
`;
// #endregion module
