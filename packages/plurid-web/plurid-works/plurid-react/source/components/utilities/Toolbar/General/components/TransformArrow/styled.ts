// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridTransformArrow {
    theme: Theme;
    pressed: boolean;
}

export const StyledPluridTransformArrow = styled.div<IStyledPluridTransformArrow>`
    user-select: none;
    cursor: pointer;
    border-radius: 50px;
    width: 25px;
    height: 25px;
    display: grid;
    place-content: center;
    padding: 2px;

    background-color: ${
        ({
            pressed,
            theme,
        }: IStyledPluridTransformArrow) => {
            if (pressed) {
                return theme.backgroundColorTertiary;
            }

            return 'initial';
        }
    };

    :hover {
        background-color: ${
            ({
                theme,
            }: IStyledPluridTransformArrow) => theme.backgroundColorTertiary
        };
    }
`;
// #endregion module
