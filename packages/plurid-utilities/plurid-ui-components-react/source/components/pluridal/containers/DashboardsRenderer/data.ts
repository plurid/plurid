// #region imports
    // #region libraries
    import React from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface DashboardRenderProperties {
    theme: Theme;
    selectedDashboard: string;
    setSelectedDashboard: React.Dispatch<string>;
    renderView: string;
    setRenderView: React.Dispatch<string>;
    fullRenderArea: boolean;
    setFullRenderArea: React.Dispatch<boolean>;
}

export interface Dashboard {
    id: string;
    icon?: React.FC<any> | JSX.Element;
    label: string;
    defaultRender?: string;
    renderers: Record<string, React.FC<any> | undefined | any>; // FORCE component as any
}
// #endregion module
