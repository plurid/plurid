import styled from 'styled-components';



export const StyledPlaneControls: any = styled.div`
    background-color: ${(props: any) => {
        if (props.transparentUI) {
            return props.theme.backgroundColorPrimaryAlpha;
        }

        return props.theme.backgroundColorDark;
    }};

    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 2fr 1fr;

    @media (max-width: 800px) {
        grid-template-columns: 1fr 3fr 1fr;
    }
`;



export const StyledPlaneControlsLeft = styled.div`
`;


export const StyledPlaneControlsCenter = styled.div`
    width: 100%;
    height: 38px;
`;


export const StyledPlaneControlsRight = styled.div`
`;
