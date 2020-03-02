import React from 'react';

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
        children,
        style,
        className,
    } = properties;

    const anchor = typeof asAnchor === 'boolean'
        ? asAnchor
        : true;


    /** handlers */
    const handleClick = (
        event: React.MouseEvent<Element, MouseEvent>,
    ) => {
        event.preventDefault();

        history.pushState(null, '', path);
        emitLocationEvent();
    }

    const emitLocationEvent = () => {
        const event = new Event('locationchanged');
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
