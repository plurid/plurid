// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        chromeControl,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPluridTransformArrow {
    theme: Theme;
    pressed: boolean;
}

export const StyledPluridTransformArrow = styled.button<IStyledPluridTransformArrow>`
    /* a chrome control: a host's \`button\` rules stay out (they leaked in, 2026-10-20) */
    ${chromeControl}
    user-select: none;
    border-radius: var(--plurid-radius);
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
                return 'var(--plurid-hover)';
            }

            return 'initial';
        }
    };

    &:hover {
        background-color: ${
            ({
                theme,
            }: IStyledPluridTransformArrow) => 'var(--plurid-hover)'
        };
    }

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }
`;
// #endregion module
