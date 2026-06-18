// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';


    import {
        plurid,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PLURID_ICON_POSITION,
        PLURID_ICON_LOCATION,
    } from '../enumerations';

    import {
        PluridIconProperties,
    } from '../interfaces';

    import {
        DEFAULT_TITLE_APPEAR_TIME,
        DEFAULT_TITLE_DISAPPEAR_TIME,
        DEFAULT_OPACITY,
    } from '../constants';
    // #endregion external


    // #region internal
    import {
        StyledPluridIcon,
        StyledPluridIconImage,
        StyledPluridIconTitle,
    } from './styled';

    import {
        numberOrDefault,
        handleSize,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
const PluridIcon: React.FC<PluridIconProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** required */
        children,

        /** optional */
        size,
        inactive,
        opacity,
        color,
        atClick,
        title,
        titlePosition,
        titleLocation,
        titleAppearTime,
        titleDisappearTime,
        theme,
        style,
        className,
    } = properties;

    /** compute */
    const activeTheme = theme || plurid;
    const activeTitlePosition = titlePosition || PLURID_ICON_POSITION.center;
    const activeTitleLocation = titleLocation || PLURID_ICON_LOCATION.under;
    const activeTitleAppearTime = numberOrDefault(titleAppearTime, DEFAULT_TITLE_APPEAR_TIME);
    const activeTitleDisappearTime = numberOrDefault(titleDisappearTime, DEFAULT_TITLE_DISAPPEAR_TIME);
    const iconSize = handleSize(size);
    const activeOpacity = opacity ?? DEFAULT_OPACITY;
    // #endregion properties


    // #region references
    const hoverInTimeout = useRef<null | NodeJS.Timeout>(null);
    const hoverOutTimeout = useRef<null | NodeJS.Timeout>(null);
    // #endregion references


    // #region state
    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);

    const [
        showTitle,
        setShowTitle,
    ] = useState(false);
    // #endregion state


    // #region effects
    /** Show title */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const canHover = window.matchMedia('(hover: hover)').matches;
            if (!canHover) {
                return;
            }
        }

        if (mouseOver && hoverOutTimeout.current) {
            hoverInTimeout.current = setTimeout(
                () => {
                    setShowTitle(true);
                },
                activeTitleAppearTime,
            );

            clearTimeout(hoverOutTimeout.current);
        }

        if (!mouseOver) {
            hoverOutTimeout.current = setTimeout(
                () => {
                    setShowTitle(false);
                    if (hoverInTimeout.current) {
                        clearTimeout(hoverInTimeout.current);
                    }
                },
                activeTitleDisappearTime,
            );
        }

        return () => {
            if (hoverOutTimeout.current) {
                clearTimeout(hoverOutTimeout.current);
            }
            if (hoverInTimeout.current) {
                clearTimeout(hoverInTimeout.current);
            }
        }
    }, [
        mouseOver,
    ]);
    // #endregion effects


    // #region render
    const renderTitle = !!(title && showTitle);

    return (
        <StyledPluridIcon
            theme={activeTheme}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => mouseOver ? null : setMouseOver(true)}
            onClick={(event: any) => atClick ? atClick(event) : null}
            style={{
                ...style,
            }}
            className={className}
        >
            <StyledPluridIconImage
                theme={activeTheme}
                iconSize={iconSize}
                inactive={inactive}
                opacity={activeOpacity}
                color={color}
            >
                {children}
            </StyledPluridIconImage>

            {renderTitle && (
                <StyledPluridIconTitle
                    theme={activeTheme}
                    iconSize={iconSize}
                    position={activeTitlePosition}
                    location={activeTitleLocation}
                >
                    {title}
                </StyledPluridIconTitle>
            )}
        </StyledPluridIcon>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridIcon;
// #endregion exports
