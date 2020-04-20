import styled from 'styled-components';



export const StyledPlaneControls: any = styled.div`
    background-color: ${(props: any) => {
        if (props.transparentUI && !props.mouseOver) {
            return 'transparent';
        }

        return props.theme.backgroundColorDark;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbraInset;
    }};

    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 2fr 1fr;
    transition: background-color 300ms linear;

    @media (max-width: 800px) {
        grid-template-columns: 1fr 3fr 1fr;
    }
`;



export const StyledPlaneControlsLeft = styled.div`
`;


export const StyledPlaneControlsCenter = styled.div`
    width: 100%;
    height: 38px;
    position: relative;
`;


export const StyledPlaneControlsRight = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 30px);
    padding: 0 1rem;
`;


export const StyledSearch = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 36px;
    border-radius: 15px;
    z-index: 9999;

    background-color: ${(props: any) => {
        return props.theme.backgroundColorDark;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowPenumbra;
    }};

    ul {
        padding: 0;
        list-style: none;
    }

    li {
        padding: 0.7rem 1.4rem;
    }

    li:hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorSecondary;
        }};
    }
`;
