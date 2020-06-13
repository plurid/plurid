import styled from 'styled-components';



export const StyledPluridViewcubeFace: any = styled.div`
    font-size: 0.6rem;
    position: absolute;
    height: 50px;
    width: 50px;
    pointer-events: none;
    display: grid;
    transform-style: preserve-3d;
    grid-template-areas: "PVFTopLeft         PVFTopCenter         PVFTopRight"
                         "PVFMiddleLeft      PVFMiddleCenter      PVFMiddleRight"
                         "PVFBottomLeft      PVFBottomCenter      PVFBottomRight";
    grid-template-rows: 10px 30px 10px;
    grid-template-columns: 10px 30px 10px;
    box-sizing: content-box;
    transition: all 300ms linear;

    border: 1px solid ${(props: any) => {
        if (props.mouseOver) {
            return props.theme.colorTertiary;
        }
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        if (props.face === 'base') {
            return '0px 0px 12px 2px ' + props.theme.boxShadowPenumbraColor;
        }
        return '';
    }};
    opacity: ${(props: any) => {
        if (!props.opaque) {
            if (props.mouseOver) {
                return '0.8';
            }
            if (!props.mouseOver) {
                return '0.4';
            }
        }
        return '1';
    }};
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


export const StyledPluridViewcubeFaceZone: any = styled.div`
    display: grid;
    place-content: center;
    cursor: pointer;
    pointer-events: all;

    grid-area: ${(props:any) => `PVF${props.type}`};
    color: ${(props: any) => {
        if (props.hovered) {
            return props.theme.colorPrimary;
        }
        return props.theme.colorSecondary;
    }};
    background-color: ${(props: any) => {
        if (props.transparentUI && !props.hovered) {
            return props.theme.backgroundColorPrimaryAlpha;
        }

        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        if (props.hovered) {
            return props.theme.backgroundColorTertiary;
        }
        return props.theme.backgroundColorSecondary;
    }};
    border: 1px solid ${(props: any) => {
        if (props.transparentUI && !props.hovered) {
            return 'transparent';
        }

        if (props.hovered) {
            return props.theme.colorTertiary;
        }
        return props.theme.backgroundColorSecondary;
    }};

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;
