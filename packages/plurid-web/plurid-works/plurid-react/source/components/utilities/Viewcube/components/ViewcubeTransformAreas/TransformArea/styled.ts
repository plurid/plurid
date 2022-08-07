// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries


    // #region internal
    import {
        TransformAreaPosition,
        transformAreaPositions,
    } from './data';
    // #endregion internal
// #region imports



// #region module
export interface IStyledTransformArea {
    theme: Theme;
}

export const StyledTransformArea = styled.div<IStyledTransformArea>`
    position: relative;
    cursor: pointer;
    height: 100%;
    width: 100%;
`;


export interface IStyledTransformLine {
    theme: Theme;
    position: TransformAreaPosition;
}

export const StyledTransformLine = styled.div<IStyledTransformLine>`
    user-select: none;
    pointer-events: none;

    position: absolute;
    top: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? '10px' : 0
    };
    right: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? '10px' : 'initial'
    };
    left: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? 0 : '10px'
    };
    height: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? '1px' : '125px'
    };
    width: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? 'initial' : '1px'
    };
    bottom: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? 'initial' : 0
    };
    background-color: ${
        ({
            theme,
        }: IStyledTransformLine) => theme.backgroundColorPrimaryAlpha
    };
`;


export interface IStyledTransformThumb {
    theme: Theme;
    value: number;
    position: TransformAreaPosition;
}

export const StyledTransformThumb = styled.div<IStyledTransformThumb>`
    user-select: none;
    pointer-events: none;

    position: absolute;
    background-color: ${
        ({
            theme,
        }: IStyledTransformThumb) => theme.backgroundColorPrimaryAlpha
    };
    top: ${
        ({
            position,
            value,
        }) => position === transformAreaPositions.horizontal ? '5px' : value + '%'
    };
    left: ${
        ({
            position,
            value,
        }) => position === transformAreaPositions.horizontal ? value + '%' : '4px'
    };

    width: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? '6px' : '12px'
    };
    height: ${
        ({
            position,
        }) => position === transformAreaPositions.horizontal ? '12px' : '6px'
    };
    border-radius: 12px;
`;
// #region module
