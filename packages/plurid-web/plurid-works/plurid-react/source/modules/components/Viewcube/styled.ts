// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridViewcube: any = styled.div`
    position: absolute;
    @media (max-width: 800px) {
        top: ${(props: any) => {
            if (props.conceal && !props.mouseOver) {
                return '-90px';
            }
            return '0';
        }};
    }
    bottom: ${(props: any) => {
        if (props.conceal && !props.mouseOver) {
            return '-90px';
        }
        return '0';
    }};
    right: ${(props: any) => {
        if (props.conceal && !props.mouseOver) {
            return '-100px';
        }
        return '0';
    }};
    position: absolute;
    user-select: none;
    transition: all 300ms ease-in-out;
    z-index: 9998;
    height: 165px;
    display: grid;
    grid-template-areas: "PVScale           PVScale         PVScale          PVScale"
                         "PVEmptyOne        PVRotateUp      PVEmptyTwo       PVTranslateY"
                         "PVRotateLeft      PVModel         PVRotateRight    PVTranslateY"
                         "PVEmptyThree      PVRotateDown    PVFitview        PVTranslateY"
                         "PVTranslateX      PVTranslateX    PVTranslateX     PVTranslateX";
    grid-template-rows: 20px 15px 95px 15px 20px;
    grid-template-columns: 15px 115px 15px 20px;

    :hover {
        opacity: 1;
    }
`;


export const StyledPluridViewcubeArrow: any = styled.div`
    display: grid;
    place-content: center;
`;


export const StyledPluridViewcubeArrowIcon: any = styled.div`
    user-select: none;
    font-size: 0.6rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 0.6rem;
    display: grid;
    place-content: center;
    cursor: pointer;

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;


export const StyledFitView: any = styled.div`
    grid-area: PVFitview;
    display: grid;
    place-content: center;
    cursor: pointer;
    user-select: none;

    svg {
        height: 0.8rem;
        width: 0.8rem;
        fill: white;
    }
`;
// #endregion module
