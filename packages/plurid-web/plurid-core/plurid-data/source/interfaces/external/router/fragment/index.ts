// #region module
export interface PluridRouteFragments {
    texts: PluridRouteFragmentText[];
    elements: PluridRouteFragmentElement[];
}

export interface PluridRouteFragment {
    type: string;
}

export interface PluridRouteFragmentText extends PluridRouteFragment {
    type: 'text';
    start: string;
    end: string;
    occurence: number;
}

export interface PluridRouteFragmentElement extends PluridRouteFragment {
    type: 'element';
    id: string;
    occurence: number;
}
// #endregion module
