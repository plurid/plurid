import React from 'react';

import './index.css';

import {
    PluridAppProperties,
} from '../modules/data/interfaces';

import PagesView from '../modules/containers/PagesView';
import DocumentsView from '../modules/containers/DocumentsView';
import ErrorView from '../modules/containers/ErrorView';



const PluridApp: React.FC<PluridAppProperties> = (properties) => {
    const {
        configuration,
        pages,
        documents,
    } = properties;

    console.log(configuration);

    if (pages && !documents) {
        return (
            <PagesView
                pages={pages}
            />
        );
    }

    if (documents && !pages) {
        return (
            <DocumentsView
                documents={documents}
            />
        );
    }

    return (
        <ErrorView
            error="the plurid' application must be either documents-based or pages-based"
        />
    );
}


export default PluridApp;
