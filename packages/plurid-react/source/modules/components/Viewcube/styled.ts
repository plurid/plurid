import styled from 'styled-components';



export const StyledViewcube: any = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;

    display: grid;
    grid-template-areas: "pluridViewcubeScale           pluridViewcubeScale         pluridViewcubeScale             pluridViewcubeScale"
                         "pluridViewcubeRotateLeft      pluridViewcubeRotateUp      pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeRotateLeft      pluridViewcubeModel         pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeRotateLeft      pluridViewcubeRotateDown    pluridViewcubeRotateRight       pluridViewcubeTranslateY"
                         "pluridViewcubeTranslateX      pluridViewcubeTranslateX    pluridViewcubeTranslateX        pluridViewcubeFitview";
    grid-template-rows: 20px 15px 95px 15px 20px;
    grid-template-columns: 15px 115px 15px 20px;

    /* height: 160px;
    width: 160px; */
    height: 225px;
    width: 240px;

    opacity: 0.4;
    padding: 10px;
    padding-top: 50px;
    padding-left: 50px;
    position: absolute;
    user-select: none;

    :hover {
        opacity: 1;
    }
`;


export const StyledViewcubeModel: any = styled.div`
    grid-area: pluridViewcubeModel;
`;


export const StyleViewcubeModelContainer: any = styled.div`
    perspective: 2000px;
    perspective-origin: 100% 80%;
`;


export const StyledViewcubeModelCube: any = styled.div`
    transform-style: preserve-3d;
    width: 50px;
    height: 50px;
`;
