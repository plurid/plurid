// #region imports
    // #region libraries
    import React from 'react';


    import {
        plurid,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        pluridRouterNavigate,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        DEFAULT_ROUTER_LINK_AS_ANCHOR,
    } from '~data/constants';
    // #endregion external


    // #region internal
    import {
        StyledPluridRouterLinkAnchor,
        StyledPluridRouterLinkDiv,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridRouterLinkOwnProperties {
    // #region required
        // #region values
        route: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        /**
         * Style as an anchor tag. Default `true`.
         */
        asAnchor?: boolean;
        target?: '_blank' | '_self';

        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        children?: React.ReactNode;
        // #endregion values

        // #region methods
        /**
         * Click handler. If it returns true it will exit preemptively.
         */
        atClick?: (
            event: React.MouseEvent<Element, MouseEvent>,
        ) => boolean | void;
        // #endregion methods
    // #endregion optional
}

const PluridRouterLink: React.FC<PluridRouterLinkOwnProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            route,
            children,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            asAnchor: asAnchorProperty,
            target,
            theme: themeProperty,
            style,
            className,
            // #endregion values

            // #region methods
            atClick,
            // #endregion methods
        // #endregion optional
    } = properties;

    const asAnchor = asAnchorProperty ?? DEFAULT_ROUTER_LINK_AS_ANCHOR;
    const theme = themeProperty || plurid;
    // #endregion properties


    // #region handlers
    const handleClick = (
        event: React.MouseEvent<Element, MouseEvent>,
    ) => {
        if (atClick) {
            const exit = atClick(event);

            if (exit) {
                return;
            }
        }

        event.preventDefault();

        if (target === '_blank') {
            window.open(route);
            return;
        }

        pluridRouterNavigate(route);
    }

    const handleKeyUp = (
        event: React.KeyboardEvent,
    ) => {
        if (event.code === 'Enter') {
            // FORCED any
            handleClick(event as any);
            return;
        }

        return;
    }
    // #endregion handlers


    // #region render
    const renderProperties = {
        tabIndex: 0,
        theme,
        style,
        className,
        onClick: handleClick,
        onKeyUp: handleKeyUp,
    };

    if (!asAnchor) {
        return (
            <StyledPluridRouterLinkDiv
                {...renderProperties}
            >
                {children}
            </StyledPluridRouterLinkDiv>
        );
    }

    return (
        <StyledPluridRouterLinkAnchor
            href={route}
            {...renderProperties}
        >
            {children}
        </StyledPluridRouterLinkAnchor>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridRouterLink;
// #endregion exports
