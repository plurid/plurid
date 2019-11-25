import { AppState } from '../store';



const getDocuments = (state: AppState) => state.data.documents;
const getViewSize = (state: AppState) => state.data.viewSize;


export default {
    getDocuments,
    getViewSize,
};
