import styled from 'styled-components';



export const StyledPluridLink = styled.a`
    cursor: pointer;
    color: #ccc;

    :hover {
        color: white;
    }

    ::after{
        content: "'"
    }
`;
