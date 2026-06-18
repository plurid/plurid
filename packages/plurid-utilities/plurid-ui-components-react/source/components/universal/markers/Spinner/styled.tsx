// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const StyledSpinner = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
`;


export interface IStyledLoader {
    theme: Theme,
    size: Sizes,
}

export const StyledLoader = styled.div<IStyledLoader>`
    display: inline-block;
    position: relative;

    width: ${(props: IStyledLoader) => {
        switch (props.size) {
            case 'small':
                return '1rem';
            case 'normal':
                return '1.8rem';
            case 'large':
                return '2.4rem';
            default:
                return '1.8rem';
        }
    }};
    height: ${(props: IStyledLoader) => {
        switch (props.size) {
            case 'small':
                return '1rem';
            case 'normal':
                return '1.8rem';
            case 'large':
                return '2.4rem';
            default:
                return '1.8rem';
        }
    }};

    div {
        width: ${(props: IStyledLoader) => {
            switch (props.size) {
                case 'small':
                    return '1rem';
                case 'normal':
                    return '1.8rem';
                case 'large':
                    return '2.4rem';
                default:
                    return '1.8rem';
            }
        }};
        height: ${(props: IStyledLoader) => {
            switch (props.size) {
                case 'small':
                    return '1rem';
                case 'normal':
                    return '1.8rem';
                case 'large':
                    return '2.4rem';
                default:
                    return '1.8rem';
            }
        }};
        margin: ${(props: IStyledLoader) => {
            switch (props.size) {
                case 'small':
                    return '0.1rem';
                case 'normal':
                    return '0.2rem';
                case 'large':
                    return '0.3rem';
                default:
                    return '0.2rem';
            }
        }};
        border: ${(props: IStyledLoader) => {
            switch (props.size) {
                case 'small':
                    return '0.1rem solid ' + props.theme.colorPrimary;
                case 'normal':
                    return '0.2rem solid ' + props.theme.colorPrimary;
                case 'large':
                    return '0.3rem solid ' + props.theme.colorPrimary;
                default:
                    return '0.2rem solid ' + props.theme.colorPrimary;
            }
        }};
        border-color: ${(props: IStyledLoader) => {
            return props.theme.colorPrimary;
        }} transparent transparent transparent;

        box-sizing: border-box;
        display: block;
        position: absolute;
        border-radius: 50%;
        animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    div:nth-child(1) {
        animation-delay: -0.45s;
    }

    div:nth-child(2) {
        animation-delay: -0.3s;
    }

    div:nth-child(3) {
        animation-delay: -0.15s;
    }

    @keyframes spinner-rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;
// #endregion module
