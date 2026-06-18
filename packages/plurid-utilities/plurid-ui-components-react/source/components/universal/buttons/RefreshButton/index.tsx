// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconReset,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region internal
    import {
        StyledRefreshButton,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface RefreshButtonProperties {
    // #region required
        // #region values
        // #endregion values

        // #region methods
        atClick: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        theme?: Theme;
        text?: string;
        disabled?: boolean;
        hideAtClick?: boolean;
        hideTime?: number;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const RefreshButton: React.FC<RefreshButtonProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // #endregion values

            // #region methods
            atClick,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            text: textProperty,
            disabled,
            hideAtClick: hideAtClickProperty,
            hideTime: hideTimeProperty,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || pluridTheme;
    const text = textProperty || '';
    const hideAtClick = hideAtClickProperty ?? true;
    const hideTime = hideTimeProperty || 1300;
    // #endregion properties


    // #region references
    const isMounted = useRef(true);
    // #endregion references


    // #region state
    const [
        showIconReset,
        setShowIconReset,
    ] = useState(true);
    // #endregion state


    // #region handlers
    const atClickHandler = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        if (disabled) {
            return;
        }

        if (hideAtClick) {
            setShowIconReset(false);
        }

        atClick(event);

        if (hideAtClick) {
            setTimeout(() => {
                if (!isMounted.current) {
                    return;
                }

                setShowIconReset(true);
            }, hideTime);
        }
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        return () => {
            isMounted.current = false;
        }
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledRefreshButton
            theme={theme}
        >
            {showIconReset && (
                <PluridIconReset
                    // #region required
                        // #region values
                        // #endregion values

                        // #region methods
                        // #endregion methods
                    // #endregion required

                    // #region optional
                        // #region values
                        theme={theme}
                        title={text}
                        inactive={disabled}
                        opacity={disabled ? 0.5 : 1}
                        // #endregion values

                        // #region methods
                        atClick={atClickHandler}
                        // #endregion methods
                    // #endregion optional
                />
            )}
        </StyledRefreshButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default RefreshButton;
// #endregion exports
