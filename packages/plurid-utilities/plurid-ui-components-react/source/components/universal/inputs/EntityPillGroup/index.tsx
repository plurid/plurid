// #region imports
    // #region libraries
    import React from 'react';

    import {
        Theme,
        plurid as pluridTheme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridUIEntityPillData,
    } from '~data/interfaces';

    import EntityPill from '~components/universal/inputs/EntityPill';
    // #endregion external


    // #region internal
    import {
        StyledEntityPillGroup,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface EntityPillGroupProperties {
    // #region required
        // #region values
        entities: (string | PluridUIEntityPillData)[];
        // #endregion values

        // #region methods
        remove: (
            id: string,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        keyFix?: string;
        theme?: Theme;
        style?: React.CSSProperties;
        pillStyle?: React.CSSProperties;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const EntityPillGroup: React.FC<EntityPillGroupProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            entities,
            // #endregion values

            // #region methods
            remove,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            keyFix,
            theme,
            style,
            pillStyle,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledEntityPillGroup
            theme={theme}
            style={{
                ...style,
            }}
        >
            {entities.map(entity => {
                const stringEntity = typeof entity === 'string';
                const id = stringEntity ? entity : entity.id;
                const text = stringEntity ? undefined : entity.text;

                return (
                    <EntityPill
                        key={`entity-pill-${id}${keyFix || ''}`}

                        id={id}
                        text={text}

                        remove={remove}

                        theme={theme || pluridTheme}
                        style={pillStyle}
                    />
                );
            })}
        </StyledEntityPillGroup>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default EntityPillGroup;
// #endregion exports
