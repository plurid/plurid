// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import {
        pluridRouterNavigate,
    } from '~services/utilities/navigate';
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
    /** properties */
    const {
        route,
        asAnchor,
        atClick,
        children,
        style,
        className,
    } = properties;

    const anchor = asAnchor ?? true;


    /** handlers */
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


    /** render */
    if (!anchor) {
        return (
            <StyledPluridRouterLinkDiv
                onClick={handleClick}
                style={{
                    ...style,
                }}
                className={className}
            >
                {children}
            </StyledPluridRouterLinkDiv>
        );
    }

    return (
        <StyledPluridRouterLinkAnchor
            href={route}
            onClick={handleClick}
            style={{
                ...style,
            }}
            className={className}
        >
            {children}
        </StyledPluridRouterLinkAnchor>
    );
}
// #endregion module



// #region exports
export default PluridRouterLink;
// #endregion exports
