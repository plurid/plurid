// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconObliterate,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import Formbutton from '../Formbutton';

    import LinkButton from '../../buttons/LinkButton';
    import PureButton from '../../buttons/PureButton';
    // #endregion external


    // #region internal
    import {
        StyledFormObliterate,
        StyledObliterateContainer,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface FormObliterateProperties {
    atObliterate: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    item?: string;

    theme?: Theme;
    devisible?: boolean;
    level?: number;

    style?: React.CSSProperties;
    className?: string;
}

/**
 * Renders an icon and a descriptive text, button-like.
 *
 * @param properties
 */
const FormObliterate: React.FC<FormObliterateProperties> = (
    properties,
) => {
    // #region properties
    /** properties */
    const {
        /** required */
        atObliterate,

        /** optional */
        item,

        theme,
        devisible,
        level,

        style,
        className,
    } = properties;

    const _theme = theme || pluridTheme;
    const _level = level ?? 0;
    const _devisible = devisible ?? false;
    // #endregion properties


    // #region state
    const [showObliterate, setShowObliterate] = useState(false);
    // #endregion state


    // #region handlers
    const handleObliterate = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        setShowObliterate(false);
        atObliterate(event);
    }
    // #endregion handlers


    // #region render
    return (
        <StyledFormObliterate
            theme={_theme}
            level={_level}
            devisible={_devisible}
            style={{
                ...style,
            }}
            className={className}
        >
            {!showObliterate && (
                <Formbutton
                    theme={_theme}
                    text={item ? `obliterate ${item}` : 'obliterate'}
                    Icon={PluridIconObliterate}
                    atClick={() => setShowObliterate(true)}
                    devisible={true}
                />
            )}

            {showObliterate && (
                <StyledObliterateContainer>
                    <div>
                        remove forever?
                    </div>

                    <LinkButton
                        theme={_theme}
                        text="cancel"
                        atClick={() => setShowObliterate(false)}
                    />

                    <PureButton
                        theme={_theme}
                        text="Obliterate"
                        atClick={(event) => handleObliterate(event as any)}
                    />
                </StyledObliterateContainer>
            )}
        </StyledFormObliterate>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default FormObliterate;
// #endregion exports
