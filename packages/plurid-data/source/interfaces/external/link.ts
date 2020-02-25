import {
    PluridComponent,
} from './page';



export interface PluridLink {
    /**
     * The name of the document. If not specified defaults to the current one.
     */
    document?: string;

    /**
     * The path of the page.
     *
     * If IDs are provided to the pages, the id of the page.
     *
     * The page path can:
     *
     * * be a simple string,
     * e.g. `'/path/to/page'` or `'/d71b21673037485a'`,
     * where `d71b21673037485a` is a generated page ID;
     *
     * * be a parametric route,
     * e.g. `'/path/to/:page'`, where `:page` is the parameter name;
     *
     * * receive query key=value pairs,
     * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are key=value pairs
     *
     * * specify a text fragment,
     * e.g. `'/path/to/page#:~:text=A%20door,is%20opened.,[0]'`,
     * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
     * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
     * and indicates the link to bring into view the first occurence `[0]`, if any,
     * of the text fragment starting with `A door` and ending with `is opened.`.
     *
     * * specify a page element,
     * e.g. `'/path/to/page#:~:element=123,[1]'`,
     * where the fragment `#:~:element=123,[1]`
     * indicates the link to bring into view the second occurence `[1]`, if any,
     * of the element with the attribute `data-plurid-element=123`.
     */
    page: string;

    /**
     * Format the link as a simple anchor element. Default `false`.
     */
    devisible?: boolean;

    /**
     * String character to be added inline after the PluridLink content. The default is `'`.
     *
     * If `devisible` the suffix is disabled.
     */
    suffix?: string;

    /**
     * Execute function at click (onClick Event).
     */
    atClick?: (event?: MouseEvent | React.MouseEvent) => void;

    /**
     * Show or not the default Not Found component, or pass a custom component
     */
    notFound?: boolean | PluridComponent;

    style?: React.CSSProperties;
    className?: string;
}
