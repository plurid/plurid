// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledDropdown: any = styled.div`
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};
    text-align: ${(props: any) => {
        if (props.left) {
            return 'left';
        }
        return 'right';
    }};
    font-size: 1rem;

    position: relative;
`;


export const StyledDropdownSelected: any = styled.div`
    cursor: pointer;
    user-select: none;
    color: ${(props: any) => {
        if (props.selectedColor) {
            return props.selectedColor;
        }

        return props.theme.colorPrimary;
    }};
`;


export const StyledDropdownList: any = styled.div`
    font-size: 0.85rem;

    background: ${(props: any) => {
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
    position: absolute;
    left: ${(props: any) => {
        if (props.left) {
            return '0px';
        }
        return 'auto';
    }};
    right: ${(props: any) => {
        if (props.left) {
            return 'auto';
        }
        return '0px';
    }};
    top: ${(props: any) => {
        if (props.listTop) {
            return props.listTop;
        }

        return '25px';
    }};
    height: ${(props: any) => {
        if (props.heightItems) {
            const value = props.heightItems * 2 + 'rem';
            if (props.heightBeyond) {
                return `calc(${value} + 1rem)`;
            }
            return value;
        }
        return 'initial';
    }};
    overflow: ${(props: any) => {
        if (props.heightItems) {
            return 'scroll';
        }
        return 'initial';
    }};

    /* Hide Scrollbar */
    scrollbar-width: none; /* Firefox 64 */
    -ms-overflow-style: none; /* Internet Explorer 11 */
    ::-webkit-scrollbar { /** WebKit */
        display: none;
    }
    width: ${(props: any) => {
        if (props.width) {
            if (typeof props.width === 'number') {
                return props.width + 'px';
            }
            if (typeof props.width === 'string') {
                return props.width;
            }
        }
        return 'initial';
    }};

    border-radius: 10px;
    min-width: 60px;

    z-index: 9998;
    box-shadow: 0px 3px 5px 1px hsla(327, 94%, 10%, 0.7);

    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    ul li {
        box-sizing: border-box;
        padding: 0.3rem 0.6rem;
        user-select: none;
        cursor: pointer;
        min-height: 2rem;
        display: grid;
        align-items: center;
        word-break: break-all;
        justify-content: ${(props: any) => {
            if (props.left) {
                return 'left';
            }
            return 'right';
        }};
    }

    ul li:hover {
        background: ${(props: any) => {
            if (props.level === 2) {
                return props.theme.backgroundColorSecondary;
            }
            return props.theme.backgroundColorTertiary;
        }};
    }

    ul li:first-child {
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
    }

    ul li:last-child {
        border-bottom-right-radius: 10px;
        border-bottom-left-radius: 10px;
    }
`;


export const StyledFilterable: any = styled.div`
    position: relative;

    input {
        text-align: ${(props: any) => {
            if (props.left) {
                return 'left !important';
            }
            return 'right !important';
        }};
    }
`;



export interface IStyledFilterUpdate {
    left?: boolean;
}

export const StyledFilterUpdate: any = styled.div<IStyledFilterUpdate>`
    position: absolute;
    z-index: 9999;
    top: 0;
    left: ${(props: any) => {
        if (props.left) {
            return 'auto';
        }
        return '0';
    }};
    right: ${(props: any) => {
        if (props.left) {
            return '0';
        }
        return 'auto';
    }};
`;
// #endregion module
