// #region imports
    // #region libraries
    import {
        TreePlane,
        RegisteredPluridPlane,
        PluridConfiguration,
        PluridView,
        PluridCluster,
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
    view: string[] | PluridView[],
    configuration: PluridConfiguration,
    clusters?: PluridCluster<C>[],
    previousTree?: TreePlane[],
}

export default class Tree<C> {
    private data: TreeData<C>;

    constructor(
        data: TreeData<C>,
    ) {
        this.data = data;
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
        );
    }
}
// #endregion module
