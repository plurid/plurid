// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconArrowRight,
        PluridIconDocuments,
        PluridIconExternalLink,
        PluridIconExit,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        Dashboard,
    } from '../../data';
    // #endregion external


    // #region internal
    import {
        StyledSidebar,
        StyledSelectors,
        StyledBranding,
        StyledHelp,
        StyledHelpItem,
    } from './styled';

    import Selector from './components/Selector';
    // #endregion internal
// #region imports



// #region module
export interface SidebarProperties {
    // #region required
        // #region values
        dashboards: Dashboard[];
        theme: Theme;

        compactSelectors: boolean;
        setCompactSelectors: React.Dispatch<boolean>;
        selectedDashboard: string;
        setSelectedDashboard: React.Dispatch<string>;
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
        // #endregion values

        // #region methods
        openManual?: () => void;
        logout?: () => void;
        // #endregion methods
    // #endregion optional
}

const Sidebar: React.FC<SidebarProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            dashboards,
            theme,

            compactSelectors,
            setCompactSelectors,
            selectedDashboard,
            setSelectedDashboard,

            identonym,
            usageType,
            // #endregion values

            // #region methods
            openManual,
            logout,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            rendererID,
            brandingName,
            brandingNameStyle,
            brandingLogo,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const openManualCount = openManual ? 1 : 0;
    const usageTypeCount = (usageType === 'PRIVATE_USAGE' && logout) ? 1 : 0;
    const helpItemsCount = openManualCount + usageTypeCount;
    // #endregion properties


    // #region state
    const [
        mouseOverSelectors,
        setMouseOverSelectors,
    ] = useState(false);
    // #endregion state


    // #region render
    const branding = (
        <StyledBranding
            compactSelectors={compactSelectors}
        >
            {!compactSelectors && (
                <>
                    <div>
                        {brandingLogo && (
                            <img
                                src={brandingLogo}
                                alt="icon"
                                height={40}
                                onClick={() => {
                                    setCompactSelectors(true);
                                    setMouseOverSelectors(false);
                                }}
                            />
                        )}
                    </div>

                    {brandingName && (
                        <div
                            style={brandingNameStyle}
                        >
                            {brandingName}
                        </div>
                    )}
                </>
            )}

            {compactSelectors
            && mouseOverSelectors
            && (
                <>
                    <PluridIconArrowRight
                        atClick={() => setCompactSelectors(false)}
                    />

                    <div>
                        {/* Empty space for alignment purposes. */}
                        &#12644;
                    </div>
                </>
            )}
        </StyledBranding>
    );

    const selectors = (
        <ul>
            {dashboards.map(dashboard => (
                <Selector
                    key={dashboard.id}
                    data={dashboard}
                    compactSelectors={compactSelectors}
                    theme={theme}
                    selectedDashboard={selectedDashboard}
                    setSelectedDashboard={setSelectedDashboard}
                    rendererID={rendererID}
                />
            ))}
        </ul>
    );

    const help = (
        <StyledHelp>
            {mouseOverSelectors && (
                <ul>
                    {openManual
                    && (
                        <StyledHelpItem
                            onClick={() => openManual()}
                            compactSelectors={compactSelectors}
                        >
                            <PluridIconDocuments />

                            {!compactSelectors && (
                                <>
                                    <div>
                                        manual
                                    </div>

                                    <PluridIconExternalLink />
                                </>
                            )}
                        </StyledHelpItem>
                    )}

                    {usageType === 'PRIVATE_USAGE'
                    && logout
                    && (
                        <StyledHelpItem
                            onClick={() => logout()}
                            compactSelectors={compactSelectors}
                        >
                            <PluridIconExit />

                            {!compactSelectors && (
                                <>
                                    <div>
                                        logout ({identonym})
                                    </div>

                                    {/* FORCED layouting. */}
                                    <div />
                                </>
                            )}
                        </StyledHelpItem>
                    )}
                </ul>
            )}
        </StyledHelp>
    );

    return (
        <StyledSidebar
            theme={theme}
        >
            <StyledSelectors
                onMouseEnter={() => setMouseOverSelectors(true)}
                onMouseLeave={() => setMouseOverSelectors(false)}
                theme={theme}
                compactSelectors={compactSelectors}
                helpItemsCount={helpItemsCount}
            >
                {branding}
                {selectors}
                {help}
            </StyledSelectors>
        </StyledSidebar>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Sidebar;
// #endregion exports
