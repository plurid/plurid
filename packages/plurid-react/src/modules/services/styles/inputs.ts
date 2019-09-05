import styled from 'styled-components';



export const StyledInputText: any = styled.input`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorPrimary;
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};

    box-shadow: inset 0px 1px 2px black;
    width: 100%;
    height: 100%;
    border-radius: 100px;
    padding-left: 30px;
    padding-right: 30px;
    font-size: 14px;
    outline: none;
    border: none;
    transition: box-shadow 300ms linear;
    font-size: 0.8rem;

    ::placeholder {
        color: ${(props: any) => {
            return props.theme.colorSecondary;
        }};
    }

    :focus {
        box-shadow: inset 0px 3px 3px black;
    }
`;


export const StyledSwitch: any = styled.label`
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        background-image: ${(props: any) => {
            if (props.backgroundImage) {
                return `url(${props.backgroundImage})`;
            }
            return;
        }};
        background-repeat: no-repeat;
        background-position: center;
        background-size: 20px;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input + .slider {
        /* background-color: #2196F3; */
        background-color: ${(props: any) => {
            if (props.backgroundColor) {
                return props.backgroundColor;
            }

            return 'hsl(247, 19%, 29%)';
        }};
        /* background-color: hsla(220, 20%, 20%, 0.5); */
        box-shadow: inset 0 2px 3px black;
    }

    /* input:focus + .slider {
        box-shadow: 0 0 1px black;
    } */

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }
`;
