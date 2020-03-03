export type RouterPartialOptions = Partial<RouterOptions>;


export interface RouterOptions {
    /**
     * Number of the routes kept in cache. Default `1000`.
     */
    cacheLimit: number;
}



export interface Fragments {
    texts: FragmentText[];
    elements: FragmentElement[];
}

export interface Fragment {
    type: string;
}

export interface FragmentText extends Fragment {
    type: 'text';
    start: string;
    end: string;
    occurence: number;
}

export interface FragmentElement extends Fragment {
    type: 'element';
    id: string;
    occurence: number;
}
