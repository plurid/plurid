// #region imports
    // #region libraries
    import React, {
        useEffect,
        useState,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        Dashboard,
    } from './data';

    import {
        StyledDashboardsRenderer,
        StyledNoDashboardRender,
    } from './styled';

    import Sidebar from './components/Sidebar';
    import RenderArea from './components/RenderArea';
    // #endregion internal
// #region imports



// #region module
export interface DashboardsRendererProperties {
    // #region required
        // #region values
        dashboards: Dashboard[];
        theme: Theme;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        rendererID?: string;
        identonym?: string;
        usageType?: string;
        brandingName?: string;
        brandingNameStyle?: React.CSSProperties;
        brandingLogo?: string;
        activeDashboard?: string;
        activeRender?: string;
        compactSelectors?: boolean;
        fullRenderArea?: boolean;
        noDashboardRender?: JSX.Element;
        // #endregion values

        // #region methods
        openManual?: () => void;
        atDashboardChange?: (newDashboard: string) => void;
        atUIChange?: (
            type: string,
            value: any,
        ) => void;

        logout?: () => void;
        // #endregion methods
    // #endregion optional
}

const DashboardsRenderer: React.FC<DashboardsRendererProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            dashboards,
            theme,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            rendererID,
            identonym,
            usageType,
            brandingName,
            brandingNameStyle,
            brandingLogo,
            activeDashboard,
            activeRender,
            compactSelectors: compactSelectorsProperty,
            fullRenderArea: fullRenderAreaProperty,
            noDashboardRender,
            // #endregion values

            // #region methods
            atDashboardChange,
            atUIChange,
            openManual,

            logout,
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region state
    const [
        compactSelectors,
        setCompactSelectors,
    ] = useState(compactSelectorsProperty ?? false);

    const [
        fullRenderArea,
        setFullRenderArea,
    ] = useState(fullRenderAreaProperty ?? false);

    const [
        selectedDashboard,
        setSelectedDashboard,
    ] = useState(activeDashboard || '');

    const [
        renderView,
        setRenderView,
    ] = useState(activeRender || '');
    // #endregion state


    // #region effects
    useEffect(() => {
        if (!activeDashboard) {
            return;
        }

        if (selectedDashboard === activeDashboard) {
            return;
        }

        setSelectedDashboard(activeDashboard);
    }, [
        activeDashboard,
    ]);

    useEffect(() => {
        if (atDashboardChange) {
            atDashboardChange(renderView);
        }
    }, [
        renderView,
    ]);

    useEffect(() => {
        if (typeof compactSelectorsProperty === 'boolean') {
            setCompactSelectors(compactSelectorsProperty);
        }

        if (typeof fullRenderAreaProperty === 'boolean') {
            setFullRenderArea(fullRenderAreaProperty);
        }
    }, [
        compactSelectorsProperty,
        fullRenderAreaProperty,
    ]);

    useEffect(() => {
        if (atUIChange) {
            atUIChange(
                'compactSelectors',
                compactSelectors,
            );
        }
    }, [
        compactSelectors,
    ]);

    useEffect(() => {
        if (atUIChange) {
            atUIChange(
                'fullRenderArea',
                fullRenderArea,
            );
        }
    }, [
        fullRenderArea,
    ]);
    // #endregion effects


    // #region render
    return (
        <StyledDashboardsRenderer
            theme={theme}
            compactSelectors={compactSelectors}
            fullRenderArea={fullRenderArea}
        >
            {!fullRenderArea && (
                <Sidebar
                    dashboards={dashboards}
                    theme={theme}

                    compactSelectors={compactSelectors}
                    setCompactSelectors={setCompactSelectors}
                    selectedDashboard={selectedDashboard}
                    setSelectedDashboard={setSelectedDashboard}
                    identonym={identonym}
                    usageType={usageType}

                    openManual={openManual}
                    logout={logout}

                    rendererID={rendererID}
                    brandingName={brandingName}
                    brandingNameStyle={brandingNameStyle}
                    brandingLogo={brandingLogo}
                />
            )}

            {selectedDashboard && (
                <RenderArea
                    dashboards={dashboards}
                    selectedDashboard={selectedDashboard}
                    setSelectedDashboard={setSelectedDashboard}
                    renderView={renderView}
                    setRenderView={setRenderView}
                    fullRenderArea={fullRenderArea}
                    setFullRenderArea={setFullRenderArea}
                    theme={theme}
                />
            )}

            {!selectedDashboard && noDashboardRender && (
                <StyledNoDashboardRender>
                    {noDashboardRender}
                </StyledNoDashboardRender>
            )}
        </StyledDashboardsRenderer>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default DashboardsRenderer;
// #endregion exports
