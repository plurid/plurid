// #region imports
    // #region libraries
    import React, {
        useEffect,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Dashboard,
    } from '../../data';
    // #endregion external


    // #region internal
    import {
        StyledRenderArea,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface RenderAreaProperties {
    // #region required
        // #region values
        dashboards: Dashboard[];
        selectedDashboard: string;
        renderView: string;
        fullRenderArea: boolean;
        theme: Theme;
        // #endregion values

        // #region methods
        setSelectedDashboard: React.Dispatch<string>;
        setRenderView: React.Dispatch<string>;
        setFullRenderArea: React.Dispatch<boolean>;
        // #endregion methods
    // #endregion required
}

const RenderArea: React.FC<RenderAreaProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            dashboards,
            selectedDashboard,
            renderView,
            fullRenderArea,
            theme,
            // #endregion values

            // #region methods
            setSelectedDashboard,
            setRenderView,
            setFullRenderArea,
            // #endregion methods
        // #endregion required
    } = properties;

    const dashboard = dashboards.find(
        dashboard => dashboard.id === selectedDashboard,
    );
    if (!dashboard) {
        return (<></>);
    }
    // #endregion properties


    // #region handlers
    const resolveView = () => {
        const dashboard = dashboards.find(
            dashboard => dashboard.id === selectedDashboard,
        );
        if (!dashboard) {
            return;
        }

        const renderViewInDashboard = dashboard.renderers[renderView];
        if (renderViewInDashboard) {
            return renderView;
        }

        if (dashboard.defaultRender) {
            return dashboard.defaultRender;
        }

        return Object.keys(dashboard.renderers)[0];
    }
    // #endregion handlers


    // #region effects
    const renderID = resolveView();

    useEffect(() => {
        if (renderID && renderID !== renderView) {
            setRenderView(renderID);
        }
    }, [
        renderID,
    ]);
    // #endregion effects


    // #region render
    if (!renderID) {
        return (<></>);
    }
    const DashboardRender = dashboard.renderers[renderID];
    if (!DashboardRender) {
        return (<></>);
    }

    return (
        <StyledRenderArea
            theme={theme}
        >
            <DashboardRender
                theme={theme}
                selectedDashboard={selectedDashboard}
                setSelectedDashboard={setSelectedDashboard}
                renderView={renderView}
                setRenderView={setRenderView}
                fullRenderArea={fullRenderArea}
                setFullRenderArea={setFullRenderArea}
            />
        </StyledRenderArea>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default RenderArea;
// #endregion exports
