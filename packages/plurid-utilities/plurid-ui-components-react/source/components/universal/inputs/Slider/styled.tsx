// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledSlider: any = styled.div`
    display: grid;
    align-items: center;
    font-family: ${(props: any) => props.theme.fontFamilySansSerif };
    grid-template-columns: 1fr;
    grid-template-rows: auto;

    width: ${(props: any) => {
        if (props.width) {
            if (typeof props.width === 'string') {
                return props.width;
            }
            return props.width + 'px';
        }
        return '100px';
    }};
`;


export const StyledNamedValue: any = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    line-height: 16px;
    user-select: none;
`;


export const StyledSliderValue = styled.div`
    user-select: none;
    font-size: 0.8rem;
    min-width: 1.6rem;
    text-align: right;
`;


export const StyledSliderInputContainer: any = styled.div`
    width: ${(props: any) => {
        if (props.width) {
            if (typeof props.width === 'string') {
                return props.width;
            }
            return props.width + 'px';
        }
        return '100px';
    }};

    /*
        article: https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/
        tool: http://danielstern.ca/range.css/
    */
   input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        margin: 2px 0;
        padding: 10px 0;
        background: transparent;
        cursor: pointer;
    }

    input[type=range]:focus {
        outline: none;
    }

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        background: ${(props: any) => props.theme.colorPrimary };
        border-radius: 0px;
    }

    input[type=range]::-webkit-slider-thumb {
        border: 2px solid ${(props: any) => props.theme.colorPrimary };
        height: ${(props: any) => {
            switch (props.thumbSize) {
                case 'small':
                    return '14px';
                case 'normal':
                    return '20px';
                case 'large':
                    return '26px';
                default:
                    return '26px';
            }
        }};
        width: ${(props: any) => {
            switch (props.thumbSize) {
                case 'small':
                    return '14px';
                case 'normal':
                    return '20px';
                case 'large':
                    return '26px';
                default:
                    return '26px';
            }
        }};
        background: ${(props: any) => {
            if (props.hovered) {
                return props.theme.colorPrimary;
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
        margin-top: ${(props: any) => {
            switch (props.thumbSize) {
                case 'small':
                    return '-6px';
                case 'normal':
                    return '-9px';
                case 'large':
                    return '-12px';
                default:
                    return '-12px';
            }
        }};
        border-radius: 50px;
        cursor: pointer;
        -webkit-appearance: none;
    }

    input[type=range]:focus::-webkit-slider-runnable-track {
        background: ${(props: any) => props.theme.colorPrimary };
    }

    input[type=range]::-moz-range-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        background: ${(props: any) => props.theme.colorPrimary };
        border-radius: 0px;
    }

    input[type=range]::-moz-range-thumb {
        border: 2px solid ${(props: any) => props.theme.colorPrimary };
        height: 15px;
        width: 15px;
        border-radius: 50px;
        background: ${(props: any) => {
            if (props.hovered) {
                return props.theme.colorPrimary;
            }

            // return '#384158';
            return props.theme.backgroundColorTertiary;
        }};
        cursor: pointer;
    }

    input[type=range]::-ms-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
    }

    input[type=range]::-ms-fill-lower {
        background: ${(props: any) => props.theme.colorPrimary };
        border-radius: 0px;
    }

    input[type=range]::-ms-fill-upper {
        background: ${(props: any) => props.theme.colorPrimary };
        border-radius: 0px;
    }

    input[type=range]::-ms-thumb {
        border: 2px solid ${(props: any) => props.theme.colorPrimary };
        height: 15px;
        width: 15px;
        border-radius: 50px;
        background: ${(props: any) => {
            if (props.hovered) {
                return props.theme.colorPrimary;
            }

            // return '#384158';
            return props.theme.backgroundColorTertiary;
        }};
        cursor: pointer;
        height: 2px;
    }

    input[type=range]:focus::-ms-fill-lower {
        background: ${(props: any) => props.theme.colorPrimary };
    }

    input[type=range]:focus::-ms-fill-upper {
        background: ${(props: any) => props.theme.colorPrimary };
    }
`;
// #endregion module
