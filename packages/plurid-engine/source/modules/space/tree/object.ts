import {
    TreePlane,
    PluridConfiguration,
    PluridView,
    PluridCluster,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from './logic';



export interface TreeData {
    planes: TreePlane[],
    clusters?: PluridCluster[],
    configuration?: PluridConfiguration,
    view?: string[] | PluridView[],
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
            configuration,
            view,
        } = this.data;

        return computeSpaceTree(
            planes,
            configuration,
            view,
        );
    }
}
