import styled from 'styled-components';



export const StyledToolbar: any = styled.div`
    bottom: ${(props: any) => {
        if (!props.hideToolbar) {
            return '-5px';
        }

        if (props.mouseIn) {
            return '-5px';
        }
        return '-55px';
    }};

    position: absolute;
    left: 0;
    right: 0;
    height: 75px;
    z-index: 9999;
    transition: bottom 300ms ease-in-out;
`;


export const StyledToolbarButtons: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};
    grid-template-columns: ${(props: any) => {
        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return 'repeat(5, 40px)';
        }

        if (!props.showTransformButtons) {
            return 'repeat(5, 70px)';
        }

        return '70px 200px 200px 200px 70px';
    }};
    width: ${(props: any) => {
        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return '260px';
        }

        if (!props.showTransformButtons) {
            return '380px';
        }

        return '770px';
    }};

    display: grid;
    align-items: center;
    justify-content: center;
    justify-items: center;
    border-radius: 22.5px;
    margin: 0 auto;
    margin-top: 10px;
    font-size: 12px;
    opacity: 1;
    height: 45px;
    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    user-select: none;
`;


export const StyledToolbarRotate: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: ${(props: any) => {
        if (!props.showTransformButtons) {
            return '1fr';
        }

        return '30px 30px 60px 30px 30px';
        // return '0.5fr 0.5fr 1fr 0.5fr 0.5fr';
    }};
`;

export const StyledToolbarTranslate: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: ${(props: any) => {
        if (!props.showTransformButtons) {
            return '1fr';
        }

        return '30px 30px 60px 30px 30px';
        // return '0.5fr 0.5fr 1fr 0.5fr 0.5fr';
    }};
`;

export const StyledToolbarScale: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: ${(props: any) => {
        if (!props.showTransformButtons) {
            return '1fr';
        }

        return '30px 60px 30px';
        // return '0.5fr 1fr 0.5fr';
    }};
`;


export const StyledToolbarTransformButton: any = styled.div`
    user-select: none;
    cursor: pointer;
    border-radius: 50px;
    width: 25px;
    height: 25px;
    display: grid;
    place-content: center;
    padding: 2px;

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;


export const StyledToolbarTransformText: any = styled.div`
    /* margin: ${(props: any) => {
        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return '0';
        }

        return '0 7px';
    }}; */
    padding: ${(props: any) => {
        if (props.button) {
            return '0';
        }

        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return '0';
        }

        return '0 7px';
    }};
    background-color: ${(props: any) => {
        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};

    height: 45px;
    display: grid;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;

    :hover {
        background: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;


export const StyledIcon = styled.div`
    width: 40px;
    display: grid;
    place-content: center;

    svg {
        height: 15px;
        width: 15px;
        fill: white;
    }
`;
