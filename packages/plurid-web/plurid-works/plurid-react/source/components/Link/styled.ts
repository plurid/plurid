// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridLink {
    theme: Theme;
    devisible: boolean;
    suffix: string;
}

export const StyledPluridLink = styled.a<IStyledPluridLink>`
    /**
     * Forces element to go to the second row if inlined.
     */
    display: inline-block;

    cursor: pointer;
    color: ${({
        theme,
    }) => {
        return theme.colorTertiary;
    }};

    :hover {
        color: ${({
            theme,
        }) => {
            return theme.colorPrimary;
        }};
    }

    ::after {
        content: "${({
            devisible,
            suffix,
        }) => {
            if (!devisible) {
                if (suffix) {
                    return suffix;
                }
                return "'";
            }
            return '';
        }}";
    }
`;
// #endregion module
