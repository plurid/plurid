import styled from 'styled-components';



export const StyledButtonInline = styled.div`
    color: ${(props: any) => {
        return props.theme.colorSecondary;
    }};
    user-select: none;
    cursor: pointer;

    :hover {
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }};

        svg {
            fill: ${(props: any) => {
                return props.theme.colorPrimary;
            }};
        }
    }

    svg {
        fill: ${(props: any) => {
            return props.theme.colorSecondary;
        }};
    }
`;
