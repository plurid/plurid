import styled from 'styled-components';



export const StyledPlaneBridge = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorDark;
    }};

    position: absolute;
    top: 0;
    left: -100px;
    height: 30px;
    width: 100px;
`;
