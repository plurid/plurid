declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.svg' {
    const svgUrl: string;
    const svgComponent: any;
    export default svgUrl;
    export { svgComponent as ReactComponent }
}
