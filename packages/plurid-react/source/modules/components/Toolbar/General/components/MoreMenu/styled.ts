import styled from 'styled-components';



export const StyledMoreMenu = styled.div`
    position: absolute;
    bottom: 55px;
    height: 250px;
    width: 320px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 22.5px;
    padding: 22px;
    font-size: 0.8rem;

    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};
`;


export const StyledMoreMenuItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;
