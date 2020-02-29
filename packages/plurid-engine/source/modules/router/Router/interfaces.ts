import {
    Indexed,
} from '@plurid/plurid-data';

import {
    CompareType,
} from '../CompareTypes';



export type RouterPartialOptions = Partial<RouterOptions>;


export interface RouterOptions {
    /**
     * Number of the routes kept in cache. Default `1000`.
     */
    cacheLimit: number;
}


export interface Route<T> {
    /**
     * The `location` can:
     *
     * * be a simple string,
     * e.g. `'/path/to/page'`;
     *
     * * be a parametric location,
     * e.g. `'/path/to/:page'`, where `:page` is the parameter name;
     *
     * * receive query `key=value` pairs,
     * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
     *
     * * specify a text fragment,
     * e.g. `'/path/to/page#:~:text=A%20door,is%20opened.,[0]'`,
     * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
     * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
     * and indicates the link to bring into view the first occurence `[0]`, if any,
     * of the text fragment starting with `A door` and ending with `is opened.`;
     *
     * * specify a page element,
     * e.g. `'/path/to/page#:~:element=123,[1]'`,
     * where the fragment `#:~:element=123,[1]`
     * indicates the link to bring into view the second occurence `[1]`, if any,
     * of the element with the attribute `data-plurid-element=123`;
     *
     * The text fragment and page element work only for plurid' pages
     * and not directly from the browser's URL bar.
     */
    location: string;

    /**
     * The view is a string, usually ALL_CAPS,
     * indicating the global container to be used by the router
     * at render time if it's a positive match.
     */
    view: T;

    /**
     * Constrain the path to be of a certain length.
     * Generally, useful for parametric paths.
     *
     * The length refers to the length of the pathname,
     * and doesn't take into consideration query, or fragments.
     *
     * If a `Indexed<number>` type is used,
     * then the index must be the parameter name.
     */
    length?: number | Indexed<number>;

    /**
     * Ensure that the `length` of the path is of a certain type:
     *
     * * `'=='`     - equal,
     * * `'<='`     - equal or less than,
     * * `'<'`      - less than,
     * * `'>='`     - equal or greater than,
     * * `'>'`      - greater than.
     *
     * Default `'<='`, if a `length` is provided.
     *
     * If a `Indexed<CompareType>` type is used,
     * then the index must be the parameter name.
     */
    lengthType?: CompareType | Indexed<CompareType>;
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
