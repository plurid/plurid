import React from 'react';



interface PluridRouterLinkOwnProperties {
    path: string;
}

const PluridRouterLink: React.FC<PluridRouterLinkOwnProperties> = (
    properties,
) => {
    /** properties */
    const {
        path,
        children,
    } = properties;


    /** handlers */
    const handleClick = (
        event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
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
    return (
        <a
            onClick={handleClick}
        >
            {children}
        </a>
    );
}


export default PluridRouterLink;
