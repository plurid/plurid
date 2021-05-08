// #region imports
    // #region libraries
    import React from 'react';

    import {
        pluridRouterNavigate,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region internal
    import {
        StyledPluridRouterLinkAnchor,
        StyledPluridRouterLinkDiv,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridRouterLinkOwnProperties {
    route: string;

    /**
     * Style as an anchor tag. Default `true`.
     */
    asAnchor?: boolean;

    /**
     * Click handler. If it returns true it will exit preemptively.
     */
    atClick?: (event: React.MouseEvent<Element, MouseEvent>) => boolean | void;

    style?: React.CSSProperties;
    className?: string;
}


const PluridRouterLink: React.FC<PluridRouterLinkOwnProperties> = (
    properties,
) => {
    // #region properties
    const {
        route,
        asAnchor,
        atClick,
        children,
        style,
        className,
    } = properties;

    const anchor = asAnchor ?? true;
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

        pluridRouterNavigate(route);
    }
    // #endregion handlers


    // #region render
    const renderProperties = {
        onClick: handleClick,
        style,
        className,
    };

    if (!anchor) {
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
