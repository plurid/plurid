// #region imports
    // #region libraries
    import styled from 'styled-components';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        SIZES,
    } from '@plurid/plurid-data';
    // #region libraries
// #region imports



// #region module
export interface IStyledOrigin {
    theme: Theme;
    size: keyof typeof SIZES;
}

const resolveSize = ({
    size,
}: IStyledOrigin) => {
    switch (size) {
        case SIZES.SMALL:
            return '5px';
        case SIZES.NORMAL:
            return '10px';
        case SIZES.LARGE:
            return '15px';
        default:
            return '10px';
    }
}

export const StyledOrigin = styled.div<IStyledOrigin>`
    background-color: ${
        ({
            theme,
        }) => theme.backgroundColorTertiaryAlpha
    };
    height: ${resolveSize};
    width: ${resolveSize};

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 99999;
    border-radius: 100px;
    user-select: none;
    pointer-events: none;
    touch-action: none;
`;
// #region module
