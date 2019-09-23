import styled from 'styled-components';



export const StyledToolbar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 60px;
`;


export const StyledToolbarButtons: any = styled.div`
    /* background: transparent; */
    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};

    display: grid;
    place-content: center;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    border-radius: 15px;
    margin: 0 15px;
    font-size: 12px;
    opacity: 1;
    width: 30px;
    height: auto;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    user-select: none;
`;
