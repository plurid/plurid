import styled from 'styled-components';



export const StyledDrawer = styled.div`
    h5 {
        font-size: 1.1rem;
        margin: 0;
    }

    margin-bottom: 2rem;

    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};
`;


export const StyledDrawerHeading = styled.div`
    user-select: none;
    cursor: pointer;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid transparent;

    :hover {
        border-bottom: 1px solid ${(props: any) => {
            return props.theme.colorPrimary;
        }};
    }
`;


export const StyledDrawerItems = styled.div`

`;
