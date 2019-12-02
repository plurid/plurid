import styled from 'styled-components';



export const StyledViewcubeFace: any = styled.div`
    font-size: 0.6rem;
    position: absolute;
    height: 50px;
    width: 50px;
    display: grid;
    transform-style: preserve-3d;
    grid-template-areas: "pluridViewcubeFaceTopLeft         pluridViewcubeFaceTopCenter         pluridViewcubeFaceTopRight"
                         "pluridViewcubeFaceMiddleLeft      pluridViewcubeFaceMiddleCenter      pluridViewcubeFaceMiddleRight"
                         "pluridViewcubeFaceBottomLeft      pluridViewcubeFaceBottomCenter      pluridViewcubeFaceBottomRight";
    grid-template-rows: 10px 30px 10px;
    grid-template-columns: 10px 30px 10px;

    transform: ${(props: any) => {
        switch (props.face) {
            case 'front':
                return 'translateZ(25px) rotateY(0deg)';
            case 'back':
                return 'translateZ(-25px) rotateY(-180deg)';
            case 'left':
                return 'translateX(-25px) rotateY(-90deg)';
            case 'right':
                return 'translateX(25px) rotateY(90deg)';
            case 'top':
                return 'translateY(-25px) rotateX(90deg)';
            case 'base':
                return 'translateY(25px) rotateX(-90deg)';
        }

        return '';
    }};
`;


export const StyledViewcubeFaceZone: any = styled.div`
    display: grid;
    place-content: center;

    grid-area: ${(props:any) => `pluridViewcubeFace${props.type}`};
    color: ${(props: any) => {
        if (props.hovered) {
            return props.theme.colorPrimary;
        }
        return props.theme.colorSecondary;
    }};
    background-color: ${(props: any) => {
        if (props.hovered) {
            return props.theme.backgroundColorTertiary;
        }
        return props.theme.backgroundColorSecondary;
    }};
    border: 1px solid ${(props: any) => {
        if (props.hovered) {
            return props.theme.colorTertiary;
        }
        return 'transparent';
    }};

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;
