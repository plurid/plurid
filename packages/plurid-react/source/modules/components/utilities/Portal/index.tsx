import React from 'react';

import {
    createPortal,
} from 'react-dom';

import {
    usePortal,
} from '@plurid/plurid-functions-react';



export interface PortalProperties {
    elementID: string;
    rootID: string;
}

/**
 * @example
 * <Portal>
 *   <p>elements</p>
 * </Portal>
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


export default PluridPortal;
