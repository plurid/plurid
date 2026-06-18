// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconSpace,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        Dashboard,
    } from '../../../../data';
    // #endregion external


    // #region internal
    import {
        StyledSelector,
        StyledSelectorRelativeLabel,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface SelectorProperties {
    // #region required
        // #region values
        data: Dashboard;
        compactSelectors: boolean;
        theme: Theme;
        selectedDashboard: string;
        // #endregion values

        // #region methods
        setSelectedDashboard: React.Dispatch<string>;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        rendererID?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const Selector: React.FC<SelectorProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            data,
            selectedDashboard,
            compactSelectors,
            theme,
            // #endregion values

            // #region methods
            setSelectedDashboard,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            rendererID,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const {
        id,
        icon,
        label,
    } = data;

    // FORCE uppercase for React.
    const Icon: any = icon;

    const selected = id === selectedDashboard;
    // #endregion properties


    // #region state
    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);
    // #endregion state


    // #region effects
    useEffect(() => {
        let mounted = true;

        if (mouseOver) {
            setTimeout(() => {
                if (!mounted) {
                    return;
                }

                setMouseOver(false);
            }, 2_000);
        }

        return () => {
            mounted = false;
        }
    }, [
        mouseOver,
    ]);
    // #endregion effects


    // #region render
    const selectorIcon = !icon
        ? (<PluridIconSpace theme={theme} />)
        : typeof icon === 'function'
            ? (<Icon theme={theme} />)
            : (<>{icon}</>);

    return (
        <StyledSelector
            key={(rendererID || '') + id}

            onClick={() => setSelectedDashboard(id)}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}

            theme={theme}
            selected={selected}
            compactSelectors={compactSelectors}
        >
            {selectorIcon}

            {!compactSelectors
            && (
                <div>
                    {label}
                </div>
            )}

            {compactSelectors
            && mouseOver
            && (
                <StyledSelectorRelativeLabel
                    theme={theme}
                >
                    {label}
                </StyledSelectorRelativeLabel>
            )}
        </StyledSelector>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Selector;
// #endregion exports
