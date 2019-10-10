import styled from 'styled-components';



export const StyledPluridLink: any = styled.a`
    cursor: pointer;
    color: ${(props: any) => {
        return props.theme.colorSecondary;
    }};

    :hover {
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }};
    }

    ::after {
        content: ${(props: any) => {
            if (!props.devisible) {
                return props.suffix;
            }
            return '';
        }};
    }
`;
