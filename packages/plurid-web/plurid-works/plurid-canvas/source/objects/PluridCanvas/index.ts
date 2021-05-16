// #region imports
    // #region external
    import {
        PluridCanvasOptions,
    } from '~data/interface';
    // #endregion external
// #endregion imports



// #region module
class PluridCanvas {
    private canvasID: string;
    private canvas: HTMLCanvasElement | undefined;


    constructor(
        canvasID: string,
        options?: PluridCanvasOptions,
    ) {
        this.canvasID = canvasID;

        if (options?.injectCanvas) {
            this.injectCanvas();
        }

        this.canvas = this.getCanvas();


        this.draw();
    }


    private injectCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = this.canvasID;
        document.appendChild(canvas);
    }

    private getCanvas() {
        const element = document.getElementById(this.canvasID);
        if (element?.nodeName.toLowerCase() === 'canvas') {
            return element as HTMLCanvasElement;
        }

        return;
    }

    private getContext() {
        if (!this.canvas) {
            return;
        }

        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            return;
        }

        return gl;
    }

    private draw() {
        const context = this.getContext();
        if (!context) {
            return;
        }

        this.drawBackground(context);
    }

    private drawBackground(
        gl: WebGLRenderingContext,
    ) {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}
// #endregion module



// #region exports
export default PluridCanvas;
// #endregion exports
