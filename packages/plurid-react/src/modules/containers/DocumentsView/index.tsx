import React from 'react';

import {
    StyledDocumentsView,
} from './styled';

import {
    PluridDocument,
} from '../../data/interfaces';



interface DocumentsViewProperties {
    documents: PluridDocument[];
}

const DocumentsView: React.FC<DocumentsViewProperties> = (properties) => {
    const {
        documents,
    } = properties;

    console.log(documents);

    return (
        <StyledDocumentsView>
            documents view
        </StyledDocumentsView>
    );
}


export default DocumentsView;
