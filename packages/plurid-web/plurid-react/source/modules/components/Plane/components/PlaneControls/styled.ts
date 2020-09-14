import styled from 'styled-components';



export const StyledPluridPlaneControls: any = styled.div`
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



export const StyledPluridPlaneControlsLeft = styled.div`
`;


export const StyledPluridPlaneControlsCenter = styled.div`
    width: 100%;
    height: 38px;
    position: relative;
`;


export const StyledPluridPlaneControlsRight = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 30px);
    padding: 0 1rem;
`;
