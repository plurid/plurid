import React from 'react';

import {
    PLURID_ROUTER_LOCATION_CHANGED,
} from '@plurid/plurid-data';

import {
    StyledPluridRouterLinkAnchor,
    StyledPluridRouterLinkDiv,
} from './styled';



interface PluridRouterLinkOwnProperties {
    path: string;

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
        path,
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

        emitLocationEvent();
    }

    const emitLocationEvent = () => {
        const event = new CustomEvent(
            PLURID_ROUTER_LOCATION_CHANGED,
            {
                detail: {
                    path,
                },
            },
        );
        window.dispatchEvent(event);
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
            href={path}
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
