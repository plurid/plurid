import styled from 'styled-components';



export const StyledViewcube: any = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    opacity: 0.4;
    position: absolute;
    user-select: none;
    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    display: grid;
    grid-template-areas: "pluridViewcubeScale           pluridViewcubeScale         pluridViewcubeScale             pluridViewcubeScale"
                         "pluridViewcubeRotateLeft      pluridViewcubeRotateUp      pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeRotateLeft      pluridViewcubeModel         pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeRotateLeft      pluridViewcubeRotateDown    pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeTranslateX      pluridViewcubeTranslateX    pluridViewcubeTranslateX        pluridViewcubeFitview";
    grid-template-rows: 20px 15px 95px 15px 20px;
    grid-template-columns: 15px 115px 15px 20px;

    :hover {
        opacity: 1;
    }
`;
