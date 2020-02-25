import {
    PropsWithChildren
} from 'react';

import { createPortal } from 'react-dom';
import usePortal from '../../../services/hooks/portal';



interface PortalProperties {
    elementID: string;
    rootID: string;
}

/**
 * @example
 * <Portal>
 *   <p>elements</p>
 * </Portal>
 */
const Portal = (
    properties: PropsWithChildren<PortalProperties>,
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


export default Portal;
