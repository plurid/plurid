import React from 'react';

import {
    StyledPluridRouterLinkAnchor,
    StyledPluridRouterLinkDiv,
} from './styled';

import {
    pluridRouterNavigate,
} from '../../services/utilities/navigate';



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


export default PluridRouterLink;
