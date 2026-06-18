// #region imports
    // #region libraries
    import React from 'react';

    import themes, {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledItemsline,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ItemslineProperties {
    items: string[];
    removeItem: (item: string) => void;

    theme?: Theme;
    level?: number;
    left?: boolean;

    style?: React.CSSProperties;
    className?: string;
}

/**
 * Renders an icon and a descriptive text.
 *
 * @param properties
 */
const Itemsline: React.FC<ItemslineProperties> = (properties) => {
    const {
        /** required */
        items,
        removeItem,

        /** optional */
        theme,
        level,
        left,

        style,
        className,
    } = properties;

    const _theme = theme === undefined
        ? themes.plurid
        : theme;

    const _level = level === undefined
        ? 0
        : level;

    const _left = left === undefined
        ? false
        : left;

    return (
        <StyledItemsline
            style={{...style}}
            className={className}
            theme={_theme}
            level={_level}
            left={_left}
        >
            {items.length > 0 && (
                <ul>
                    {items.map(item => {
                        return (
                            <li
                                key={item + Math.random()}
                                onClick={() => removeItem(item)}
                            >
                                {item}
                            </li>
                        );
                    })}
                </ul>
            )}
        </StyledItemsline>
    );
}
// #endregion module



// #region exports
export default Itemsline;
// #endregion exports
