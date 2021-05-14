// #region imports
    // #region libraries
    import {
        PluridPlaneComponentProperty,
        PluridRouteComponentProperty,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const isClassComponent = (component: any) => {
    return (
        typeof component === 'function' &&
        !!component.prototype.isReactComponent
    );
}

const isFunctionComponent = (component: any) => {
    return (
        typeof component === 'function' &&
        String(component).includes('return React.createElement')
    );
}

const isReactComponent = (component: any) => {
    return (
        isClassComponent(component) ||
        isFunctionComponent(component)
    );
}


export const isReactRenderable = (
    component: PluridReactComponent<
        any, PluridPlaneComponentProperty | PluridRouteComponentProperty
    > | undefined,
) => {
    if (!component) {
        return false;
    }

    // Check if elementql component.
    if (typeof component === 'string') {
        return false;
    }

    return isReactComponent(component);
}
// #endregion module
