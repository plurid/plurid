// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridLink {
    theme: Theme;
    devisible: boolean;
    suffix: string;
    /** `elements.link.draggable`: a link is the space's, not a draggable browser link, unless a host says so. */
    draggable?: boolean;
}

export const StyledPluridLink = styled.a<IStyledPluridLink>`
    /**
     * Forces element to go to the second row if inlined.
     */
    display: inline-block;

    /* A PRESS ON A LINK IS THE SPACE'S: an anchor with an href is natively draggable, so a drag
       that starts on a link would tear a link ghost out of the plane instead of orbiting. The
       draggable attribute carries the rule everywhere; WebKit needs the property too.
       (No backticks in this comment: one would end the styled template.) */
    -webkit-user-drag: ${({ draggable }) => (draggable ? 'auto' : 'none')};

    cursor: pointer;
    color: ${({
        theme,
    }) => {
        return 'var(--plurid-accent)';
    }};

    &:hover {
        color: ${({
            theme,
        }) => {
            return 'var(--plurid-ink)';
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
