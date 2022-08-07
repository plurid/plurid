// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledTransformArea {
    theme: Theme;
}

export const StyledTransformArea = styled.div<IStyledTransformArea>`
    position: relative;
`;


export interface IStyledTransformLine {
    theme: Theme;
    position: 'vertical' | 'horizontal';
}

export const StyledTransformLine = styled.div<IStyledTransformLine>`
    position: absolute;
    top: ${
        ({
            position
        }) => position === 'horizontal' ? '10px' : 0
    };
    right: ${
        ({
            position
        }) => position === 'horizontal' ? '10px' : 'initial'
    };
    left: ${
        ({
            position
        }) => position === 'horizontal' ? 0 : '10px'
    };
    height: ${
        ({
            position
        }) => position === 'horizontal' ? '1px' : '125px'
    };
    width: ${
        ({
            position
        }) => position === 'horizontal' ? 'initial' : '1px'
    };
    bottom: ${
        ({
            position
        }) => position === 'horizontal' ? 'initial' : 0
    };
    background-color: ${
        ({
            theme,
        }: IStyledTransformLine) => theme.backgroundColorPrimaryAlpha
    };
`;
// #region module
