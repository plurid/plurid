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
    grid-template-columns: 1fr 1fr 1fr;
    border-radius: 22.5px;
    margin: 0 auto;
    font-size: 12px;
    opacity: 1;
    width: 300px;
    height: 100%;

    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    user-select: none;
`;
