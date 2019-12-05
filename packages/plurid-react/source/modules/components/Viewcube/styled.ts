import styled from 'styled-components';



export const StyledViewcube: any = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    position: absolute;
    user-select: none;
    transition: opacity 300ms ease-in-out;
    z-index: 9998;
    display: grid;
    grid-template-areas: "pluridViewcubeScale           pluridViewcubeScale         pluridViewcubeScale          pluridViewcubeScale"
                         "pluridViewcubeEmptyOne        pluridViewcubeRotateUp      pluridViewcubeEmptyTwo       pluridViewcubeTranslateY"
                         "pluridViewcubeRotateLeft      pluridViewcubeModel         pluridViewcubeRotateRight    pluridViewcubeTranslateY"
                         "pluridViewcubeEmptyThree      pluridViewcubeRotateDown    pluridViewcubeFitview        pluridViewcubeTranslateY"
                         "pluridViewcubeTranslateX      pluridViewcubeTranslateX    pluridViewcubeTranslateX     pluridViewcubeTranslateX";
    grid-template-rows: 20px 15px 95px 15px 20px;
    grid-template-columns: 15px 115px 15px 20px;

    opacity: ${(props: any) => {
        if (props.transparent) {
            return '0.4';
        }
        return '1';
    }};

    :hover {
        opacity: 1;
    }
`;


export const StyledViewcubeArrow: any = styled.div`
    display: grid;
    place-content: center;
`;


export const StyledViewcubeArrowIcon: any = styled.div`
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
    grid-area: pluridViewcubeFitview;
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
