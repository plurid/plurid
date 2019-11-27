import styled from 'styled-components';



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
