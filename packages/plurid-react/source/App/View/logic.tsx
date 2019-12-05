import React from 'react';

import PagesView from '../../modules/containers/PagesView';
import DocumentsView from '../../modules/containers/DocumentsView';
import ErrorView from '../../modules/containers/ErrorView';

import {
    PluridPage,
    PluridDocument,
} from '@plurid/plurid-data';



const handleView = (
    pages: PluridPage[] | undefined,
    documents: PluridDocument[] | undefined,
): JSX.Element => {
    if (pages && !documents) {
        return (
            <PagesView />
        );
    }

    if (documents && !pages) {
        return (
            <DocumentsView />
        );
    }

    return (
        <ErrorView
            error="the plurid' application must be either documents or pages-based"
        />
    );
}


export default handleView;
