// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    // import PluridLink from '../Link';
    // #endregion external
// #endregion imports



// #region module
export interface RenderLink {
    start: number;
    length: number;
    link: any;
}

export interface RendererProperties {
    text: string;
    links: RenderLink[];
}

export interface RenderNode {
}

const Renderer: React.FC<RendererProperties> = () => {
    return (
        <div>
        </div>
    );
}
// #endregion module



// #region exports
export default Renderer;
// #endregion exports
