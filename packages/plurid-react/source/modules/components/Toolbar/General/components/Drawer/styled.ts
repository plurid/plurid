import styled from 'styled-components';



export const StyledDrawer: any = styled.div`
    h5 {
        font-size: 1rem;
        margin: 0;
    }

    margin-bottom: 2rem;
    padding-bottom: 0.5rem;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;

    background-color: ${(props: any) => {
        if (props.transparentUI && props.mouseOver) {
            return props.theme.backgroundColorSecondary;
        }
        return 'transparent';
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};
`;


export const StyledDrawerHeading: any = styled.div`
    user-select: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid transparent;

    :hover {
        border-bottom: 1px solid ${(props: any) => {
            return props.theme.colorPrimary;
        }};
    }
`;


export const StyledDrawerItems = styled.div`

`;
