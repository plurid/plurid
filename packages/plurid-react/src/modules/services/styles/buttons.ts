import styled from 'styled-components';



export const StyledButton = styled.button`
    display: block;
    color: white;
    width: 100%;
    border: none;
    outline: none;
    user-select: none;
    cursor: pointer;
    display: grid;
    place-content: center;
    border-radius: 21px;
    font-size: 0.8rem;
    font-weight: bold;
    height: 42px;
    background-color: ${(props: any) => {
        return props.theme.backgroundColorPrimaryAlpha;
    }};
    box-shadow: 0px 10px 10px 0px ${(props: any) => {
        return props.theme.shadow;
    }};
    transition: box-shadow 200ms linear;

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
    }

    :active {
        box-shadow: 0px 3px 3px 0px ${(props: any) => {
            return props.theme.shadow;
        }};
    }

    :disabled {
        cursor: not-allowed;
        background-color: ${(props: any) => {
            return props.theme.backgroundColorPrimaryAlpha;
        }};
        opacity: 0.3;
    }
`;

export const StyledLinkButton = styled.button`
    display: block;
    color: white;
    width: 100%;
    border: none;
    outline: none;
    user-select: none;
    cursor: pointer;
    display: grid;
    place-content: center;
    font-size: 15px;
    font-weight: bold;
    background: transparent;
`;
