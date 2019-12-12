import { AppState } from '../store';



const getDocuments = (state: AppState) => state.data.documents;


export default {
    getDocuments,
};
