// #region imports
    // #region libraries
    import styled, {
        css,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledEntityView {
    theme: Theme;
}

export const StyledEntityView = styled.div<IStyledEntityView>`
    position: relative;
    height: 100%;

    button {
        font-family: ${
            ({
                theme,
            }: IStyledEntityView) => theme.fontFamilySansSerif
        };
    }
`;


export const StyledEntityViewTop = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    align-items: center;
    margin-bottom: 30px;
`;


export const StyledEntityFilterLine = styled.div`
    position: relative;
`;


export interface IStyledEntityFilterCancel {
    filterLength: string;
}

export const StyledEntityFilterCancel = styled.div<IStyledEntityFilterCancel>`
    position: absolute;
    top: 10px;

    left: ${
        ({
            filterLength,
        }: IStyledEntityFilterCancel) => filterLength === 'SMALL' ? '275px' : '575px'
    };
`;


export const StyledTopButtons = styled.div`
    text-align: right;
`;


export const StyledEntityListContainer = styled.div`
`;


export type IStyledEntityList = {
    theme: Theme;
    header?: boolean;
    loading?: number;
} & any; // FORCED

export const StyledEntityList = styled.ul<IStyledEntityList>`
    padding: 0;
    margin: 0;
    list-style: none;
    max-height: 500px;
    overflow: auto;

    background-color: ${
        ({
            theme,
        }: IStyledEntityList) => theme.backgroundColorSecondaryAlpha
    };
    box-shadow: ${
        ({
            theme,
        }: IStyledEntityList) => theme.boxShadowUmbraInset
    };
    opacity: ${
        ({
            loading,
        }: IStyledEntityList) => {
            if (loading) {
                return '0.5';
            }

            return '1';
        }
    };

    li:first-child {
        background-color: ${
            ({
                theme,
                header,
            }: IStyledEntityList) => {
                if (header) {
                    return theme.backgroundColorTertiary;
                }

                return 'initial';
            }
        };
    }

    ${({
        header,
    }: IStyledEntityList) => {
        if (header) {
            return;
        }

        return css`
            li:hover {
                background-color: ${
                    ({
                        theme,
                    }: IStyledEntityList) => theme.backgroundColorPrimary
                };
            }
        `
    }}
`;


export interface IStyledEntityListItem {
    rowTemplate: string;
}

export const StyledEntityListItem = styled.li<IStyledEntityListItem>`
    display: grid;
    grid-template-columns: ${
        ({
            rowTemplate,
        }: IStyledEntityListItem) => rowTemplate
    };
    grid-gap: 0.5rem;
    padding: 0.7rem;
    align-items: center;
    min-height: 45px;
    word-break: break-all;
`;


export const StyledActionButton = styled.div`
    width: 200px;
    position: absolute;
    bottom: 0;
    right: 0;
`;


export const StyledNoRows = styled.div`
    margin: 20px 0;
    text-align: center;
`;
// #endregion module
