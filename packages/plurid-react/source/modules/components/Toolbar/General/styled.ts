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

    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 1fr 0.5fr 1fr;
    border-radius: 22.5px;
    margin: 0 auto;
    font-size: 12px;
    opacity: 1;
    width: 500px;
    height: 100%;

    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    user-select: none;
`;


export const StyledToolbarRotate: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 0.5fr 0.5fr 1fr 0.5fr 0.5fr;
`;

export const StyledToolbarTranslate: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 0.5fr 0.5fr 1fr 0.5fr 0.5fr;
`;

export const StyledToolbarScale: any = styled.div`
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: 0.5fr 1fr 0.5fr;
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
    margin: 0 7px;

    /* width: 60px; */
    height: 45px;

    padding: 0 7px;

    display: grid;
    align-items: center;
    justify-content: center;
    /* place-content: center; */

    background-color: ${(props: any) => {
        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};

    :hover {
        background: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }
`;


export const StyledIcon = styled.div`
    svg {
        height: 20px;
        width: 20px;
        fill: white;
    }
`;
