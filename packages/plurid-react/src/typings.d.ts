declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

interface ISvgrComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
    const svgUrl: string;
    const svgComponent: ISvgrComponent;
    export default svgUrl;
    export { svgComponent as ReactComponent }
}

declare module 'plurid-engine';
