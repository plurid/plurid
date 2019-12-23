export interface PluridLink {
    /**
     * The name of the document. If not specified defaults to the current one.
     */
    document?: string;

    /**
     * The path of the page.
     *
     * If IDs are provided to the pages, the id of the page.
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

    style: React.CSSProperties,
}
