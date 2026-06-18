// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledTextline: any = styled.div`
    position: relative;
    display: inline-block;
    width: 100%;

    input {
        box-sizing: border-box;
        border: none;
        outline: none;
        font-size: 0.8rem;

        padding: ${(props: any) => {
            if (props.devisible) {
                return '0';
            }
            return '0.6rem 1rem';
        }};
        padding-top: ${(props: any) => {
            if (props.devisible) {
                return '0';
            }
            return '0.7rem';
        }};
        min-height: ${(props: any) => {
            if (props.devisible) {
                return 'initial';
            }
            return '36px';
        }};
        background-color: ${(props: any) => {
            if (props.devisible) {
                return 'transparent';
            }

            switch (props.level) {
                case 0:
                    return props.theme.backgroundColorPrimary;
                case 1:
                    return props.theme.backgroundColorSecondary;
                case 2:
                    return props.theme.backgroundColorTertiary;
                case 3:
                    return props.theme.backgroundColorQuaternary;
                default:
                    return props.theme.backgroundColorPrimary;
            }
        }};
        color: ${(props: any) => {
            return props.theme.colorPrimary;
        }};
        box-shadow: inset 0px 4px 4px ${(props: any) => {
            if (props.devisible) {
                return 'transparent';
            }

            return props.theme.boxShadowUmbraColor;
        }};
        border-radius: ${(props: any) => {
            if (props.devisible) {
                return '0';
            }

            if (props.round) {
                return '1000px';
            }
            return '0px';
        }};
        width: ${(props: any) => {
            if (!props.width) {
                return '100%';
            }

            if (typeof props.width === 'number') {
                return props.width + 'px';
            }

            return props.width;
        }};
        text-align: ${(props: any) => {
            if (props.center) {
                return 'center';
            }

            return 'left';
        }};

        ::placeholder {
            color: ${(props: any) => {
                return props.theme.colorSecondary;
            }};
        }
    }
`;


export const StyledEnterIcon: any = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 20px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    user-select: none;
    cursor: pointer;
    border: 1px solid transparent;

    right: ${(props: any) => {
        if (props.left) {
            return 'auto';
        }
        return '0.6rem';
    }};
    left: ${(props: any) => {
        if (props.left) {
            return '0.6rem';
        }
        return 'auto';
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};

    :hover {
        border: 1px solid ${(props: any) => {
            return props.theme.colorPrimary;
        }};
    }
`;


export const StyledErrorLine: any = styled.div`
    position: absolute;
    background-color: #FF0000;
    bottom: -2px;

    height: ${(props: any) => {
        if (props.devisible) {
            return '2px';
        }

        return '4px';
    }};
    left: ${(props: any) => {
        if (props.devisible) {
            return '0';
        }

        if (!props.round) {
            return '0';
        }

        return '14px';
    }};
    right: ${(props: any) => {
        if (props.devisible) {
            return '0';
        }

        if (!props.round) {
            return '0';
        }

        return '14px';
    }};
    border-radius: ${(props: any) => {
        if (props.devisible) {
            return '0';
        }

        if (props.round) {
            return '10px';
        }
        return '0px';
    }};
    box-shadow: 0px 1px 3px 0px ${(props: any) => {
        if (props.devisible) {
            return 'initial';
        }

        return props.theme.boxShadowUmbraColor;
    }};
`;
// #endregion module
