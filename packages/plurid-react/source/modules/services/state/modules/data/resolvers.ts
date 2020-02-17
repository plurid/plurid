import * as Types from './types';



export const setDocuments = (
    state: Types.State,
    action: Types.DataSetDocumentsAction,
): Types.State => {
    return {
        ...state,
        documents: {
            ...action.payload,
        },
    };
}
