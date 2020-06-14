import {
    TreePlane,
    RegisteredPluridPlane,
    PluridConfiguration,
    PluridView,
    PluridCluster,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from './logic';



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
