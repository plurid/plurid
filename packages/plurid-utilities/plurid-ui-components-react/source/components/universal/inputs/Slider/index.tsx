// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledSlider,
        StyledNamedValue,
        StyledSliderInputContainer,
        StyledSliderValue,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const DEFAULT_VALUE = 0;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const DEFAULT_LEVEL = 0;
const DEFAULT_THUMB_SIZE = 'large';

export interface SliderProperties {
    value: number;
    atChange: (value: number) => void;

    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    name?: string;
    theme?: Theme;
    level?: number;
    thumbSize?: 'small' | 'normal' | 'large';
    width?: number | string;
    valueSign?: string;
    namedValueAbove?: boolean;
}

const Slider: React.FC<SliderProperties> = (
    properties,
) => {
    // #region properties
    const {
        value,
        atChange,

        defaultValue,
        min,
        max,
        step,
        name,
        theme,
        level,
        thumbSize,
        width,
        valueSign,
        namedValueAbove,
    } = properties;

    const [mouseOver, setMouseOver] = useState(false);

    const _theme = theme || pluridTheme;

    const _level = level === undefined
        ? DEFAULT_LEVEL
        : level;

    const _thumbSize = thumbSize === undefined
        ? DEFAULT_THUMB_SIZE
        : thumbSize;

    const _step = step === undefined
        ? DEFAULT_STEP
        : step;
    // #endregion properties


    // #region handlers
    const handleDoubleClick = () => {
        atChange(defaultValue || DEFAULT_VALUE);
    }

    const handleSliderInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        atChange(parseFloat(event.target.value));
    }
    // #endregion handlers


    // #region render
    return (
        <StyledSlider
            theme={_theme}
            width={width}
        >
            {namedValueAbove && (
                <StyledNamedValue>
                    <div>
                        {name}
                    </div>

                    <StyledSliderValue
                        theme={_theme}
                    >
                        {value}{valueSign}
                    </StyledSliderValue>
                </StyledNamedValue>
            )}

            <StyledSliderInputContainer
                theme={_theme}
                hovered={mouseOver}
                thumbSize={_thumbSize}
                level={_level}
                width={width}
            >
                <input
                    type="range"
                    min={min || DEFAULT_MIN}
                    max={max || DEFAULT_MAX}
                    name={name || ''}
                    value={value}
                    step={_step}
                    onMouseEnter={() => setMouseOver(true)}
                    onMouseLeave={() => setMouseOver(false)}
                    onMouseMove={() => mouseOver ? setMouseOver(true) : null}
                    onChange={handleSliderInput}
                    onDoubleClick={handleDoubleClick}
                />
            </StyledSliderInputContainer>
        </StyledSlider>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Slider;
// #endregion exports
