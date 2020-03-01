import {
    PluridPartialConfiguration,
    PluridPage,
    PluridDocument,
    PluridView,
} from '@plurid/plurid-data';



export const serverComputeApplication = (
    pages: PluridPage[],
    view: string[] | PluridView[],
    documents: PluridDocument[],
    configuration: PluridPartialConfiguration,
): any => {
    // render application state and string of elements for ssr

    return {
        state: {},
        asString: '',
    };
}
