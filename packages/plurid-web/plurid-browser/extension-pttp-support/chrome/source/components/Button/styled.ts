import styled from 'styled-components';



export const StyledButton: any = styled.div`
    button {
        background: ${(props: any) => {
            return props.theme.backgroundColorSecondary;
        }};
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }};
        box-shadow: 0px 5px 5px 0px ${(props: any) => {
            return props.theme.boxShadowUmbraColor;
        }};
        cursor: pointer;
        user-select: none;
        text-shadow: none;
        border: none;
        outline: none;
        padding: 0;
        text-align: center;
        font-size: 13px;
        width: 100%;
        height: 40px;
        border-radius: 30px;
        margin-bottom: 10px;
        transition: box-shadow 100ms linear !important;
    }

    button:hover {
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }} !important;
        background: ${(props: any) => {
            return props.theme.backgroundColorSecondary;
        }} !important;
        box-shadow: 0px 3px 3px 0px ${(props: any) => {
            return props.theme.boxShadowUmbraColor;
        }} !important;
    }

    button:active {
        box-shadow: 0px 1px 1px 0px ${(props: any) => {
            return props.theme.boxShadowUmbraColor;
        }} !important;
    }

    button:disabled {
        opacity: 0.5;
        box-shadow: 0px 5px 5px 0px ${(props: any) => {
            return props.theme.boxShadowUmbraColor;
        }} !important;
        cursor: none;
    }
`;
