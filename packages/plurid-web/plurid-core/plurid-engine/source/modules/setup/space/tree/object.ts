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
export interface TreeData {
    planes: Map<string, RegisteredPluridPlane>,
    view: string[] | PluridView[],
    configuration: PluridConfiguration,
    clusters?: PluridCluster[],
    previousTree?: TreePlane[],
}

export default class Tree {
    private data: TreeData;

    constructor(
        data: TreeData,
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
