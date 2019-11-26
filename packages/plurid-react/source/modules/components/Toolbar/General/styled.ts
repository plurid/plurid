import styled from 'styled-components';



export const StyledToolbar = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 15px;
    height: 45px;
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
            return 'repeat(4, 40px)';
        }

        return '1fr 0.5fr 1fr 40px';
    }};

    display: grid;
    align-items: center;
    justify-content: center;
    justify-items: center;
    border-radius: 22.5px;
    margin: 0 auto;
    font-size: 12px;
    opacity: 1;
    height: 100%;
    width: ${(props: any) => {
        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return '200px';
        }

        return '500px';
    }};

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

        return '0.5fr 0.5fr 1fr 0.5fr 0.5fr';
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

        return '0.5fr 0.5fr 1fr 0.5fr 0.5fr';
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

        return '0.5fr 1fr 0.5fr';
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
    margin: ${(props: any) => {
        if (
            props.showIcons
            && !props.showTransformButtons
        ) {
            return '0';
        }

        return '0 7px';
    }};
    padding: ${(props: any) => {
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


export const StyledMoreMenu = styled.div`
    position: absolute;
    bottom: 55px;
    height: 250px;
    width: 300px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 22.5px;

    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};
`;
