// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledFormline {
    theme: Theme,
    level: number;
    responsive: boolean;
}

export const StyledFormline = styled.div<IStyledFormline>`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    min-height: 2rem;
    padding: 0.3rem 0.7rem;

    color: ${(props: IStyledFormline) => {
        return props.theme.colorPrimary;
    }};

    @media (max-width: 800px) {
        grid-template-columns: ${(props: IStyledFormline) => {
            if (props.responsive) {
                return '1fr';
            }
            return '1fr 1fr';
        }};
        min-height: ${(props: IStyledFormline) => {
            if (props.responsive) {
                return '2.4rem';
            }
            return '2rem';
        }};
        justify-items: ${(props: IStyledFormline) => {
            if (props.responsive) {
                return 'center';
            }
            return 'auto';
        }};
        justify-content: ${(props: IStyledFormline) => {
            if (props.responsive) {
                return 'center';
            }
            return 'auto';
        }};
    }
`;


export const StyledFormlineText = styled.div`
    user-select: none;
`;



export interface IStyledFormlineElement {
    responsive: boolean;
}

export const StyledFormlineElement = styled.div<IStyledFormlineElement>`
    justify-self: right;

    @media (max-width: 800px) {
        justify-self: ${(props: IStyledFormlineElement) => {
            if (props.responsive) {
                return 'center';
            }
            return 'right';
        }};
    }
`;
// #endregion module
