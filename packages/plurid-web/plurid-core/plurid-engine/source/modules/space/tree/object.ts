// #region imports
    // #region libraries
    import {
        TreePlane,
        RegisteredPluridPlane,
        PluridConfiguration,
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        computeSpaceTree,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export interface TreeData<C> {
    planes: Map<string, RegisteredPluridPlane<C>>,
    view: PluridApplicationView,
    configuration: PluridConfiguration,
    previousTree?: TreePlane[],
}

export default class Tree<C> {
    private data: TreeData<C>;
    private origin: string;

    constructor(
        data: TreeData<C>,
        origin: string = 'origin',
    ) {
        this.data = data;
        this.origin = origin;
    }

    public compute() {
        const {
            planes,
            view,
            configuration,
        } = this.data;

        return computeSpaceTree(
            planes,
            view,
            configuration,
            this.origin,
        );
    }
}
// #endregion module
