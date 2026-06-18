// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledSelect,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridSelectProperties {
    selectables: string[];
    atChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

    theme?: Theme;
    level?: number;
    devisible?: boolean;
    round?: boolean;
    width?: string | number;
}

/**
 * @param selectables `string[]`
 * @param atChange `(event: React.ChangeEvent<HTMLInputElement>) => void`
 *
 * @param theme optional - `Theme`
 * @param level optional - `number`
 * @param devisible optional - `boolean`
 * @param round optional - `boolean`
 * @param width optional - `string | number`
 */
const PluridSelect: React.FC<PluridSelectProperties> = (
    properties,
) => {
    // #region properties
    const {
        selectables,
        atChange,

        theme,
        level,
        devisible,
        round,
        width,
    } = properties;

    const _theme = theme || pluridTheme;
    const _level = level ?? 0;
    const _round = round ?? true;
    // #endregion properties


    // #region render
    return (
        <StyledSelect
            theme={_theme}
            level={_level}
            devisible={devisible}
            round={_round}
            width={width}
        >
            <select>
                {selectables.map(selectable => {
                    return (
                        <option
                            key={selectable}
                            value={selectable}
                        >
                            {selectable}
                        </option>
                    );
                })}
            </select>
        </StyledSelect>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridSelect;
// #endregion exports
