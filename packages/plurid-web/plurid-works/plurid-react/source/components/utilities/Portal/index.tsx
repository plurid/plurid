// #region imports
    // #region libraries
    import React from 'react';

    import {
        createPortal,
    } from 'react-dom';

    import {
        usePortal,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries
// #endregion imports



// #region module
export interface PortalProperties {
    elementID: string;
    rootID: string;
    children?: React.ReactNode;
}

/**
 * @example
 * <Portal>
 *   <p>elements</p>
 * </Portal>
 *
 */
const PluridPortal: React.FC<PortalProperties> = (
    properties,
) => {
    const {
        elementID,
        rootID,
        children,
    } = properties;

    const target = usePortal(elementID, rootID);

    return createPortal(
        children,
        target,
    );
};
// #endregion module



// #region exports
export default PluridPortal;
// #endregion exports
