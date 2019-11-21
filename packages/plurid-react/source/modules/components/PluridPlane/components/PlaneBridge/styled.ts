import styled from 'styled-components';



export const StyledPlaneBridge: any = styled.div`
    background-color: ${(props: any) => {
        if (props.planeOpacity === 0) {
            return 'transparent';
        }

        if (!props.planeControls) {
            return props.theme.backgroundColorPrimary;
        }

        return props.theme.backgroundColorDark;
    }};

    position: absolute;
    top: 0;
    left: -100px;
    height: 30px;
    width: 100px;
    opacity: 0.5;
`;
