import styled from 'styled-components';



export const StyledToolbar: any = styled.div`
    bottom: ${(props: any) => {
        if (!props.conceal) {
            return '-5px';
        }

        if (props.mouseIn) {
            return '-5px';
        }
        return '-55px';
    }};
    pointer-events: ${(props: any) => {
        if (props.showMenu) {
            return 'all';
        }
        return 'none';
    }};

    display: grid;
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
            if (props.documentsBased) {
                return 'repeat(6, minmax(min-content, 40px))';
            } else {
                return 'repeat(5, minmax(min-content, 40px))';
            }
        }

        if (!props.showTransformButtons) {
            if (props.documentsBased) {
                return 'repeat(6, minmax(min-content, 40px))';
            } else {
                return 'repeat(5, minmax(min-content, 40px))';
            }
        }

        if (props.documentsBased) {
            return '40px 200px 200px 200px 40px 40px';
        }

        return '40px 200px 200px 200px 40px';
    }};
    opacity: ${(props: any) => {
        if (!props.opaque && !props.mouseIn) {
            return '0.4';
        }
        return '1';
    }};

    z-index: 9999;
    user-select: none;
    /* height: 75px; */
    display: grid;
    pointer-events: all;
    display: grid;
    align-items: center;
    justify-content: center;
    justify-items: center;
    border-radius: 22.5px;
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: 20px;
    padding: 0 22.5px;
    font-size: 12px;
    height: 45px;
    transition: opacity 300ms ease-in-out;

    :after {
        content: '';
        position: absolute;
        top: 55px;
        left: 0;
        right: 0;
        height: 20px;
    }
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
    min-width: ${(props: any) => {
        if (props.button) {
            return '40px';
        }

        return '70px';
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
