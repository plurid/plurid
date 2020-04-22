import styled from 'styled-components';



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
