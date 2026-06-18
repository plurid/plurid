// #region imports
    import {
        HSLColorClass,
        HSLColorValues,
    } from '../../interfaces';
// #endregion imports



// #region module
class HSLColor implements HSLColorClass {
    private _saturation: number;
    private _hue: number;
    private _lightness: number;
    private _alpha: number | undefined;

    constructor(colors: HSLColorValues) {
        this._saturation = colors.saturation;
        this._hue = colors.hue;
        this._lightness = colors.lightness;
        this._alpha = colors.alpha;
    }

    public saturation(): number {
        return this._saturation;
    }

    public hue(): number {
        return this._hue;
    }

    public lightness(): number {
        return this._lightness;
    }

    public alpha(): number | undefined {
        return this._alpha;
    }

    public display(): string {
        if (this._alpha) {
            return `hsla(${this._saturation}, ${this._hue}%, ${this._lightness}%, ${this._alpha})`;
        }

        return `hsl(${this._saturation}, ${this._hue}%, ${this._lightness}%)`;
    }
}
// #endregion module



// #region exports
export default HSLColor;
// #endregion exports
