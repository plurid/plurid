import React from 'react';

// import PluridLink from '../Link';



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


export default Renderer;
