import React from 'react';

import {
    StyledDocumentsView,
} from './styled';

// import {
//     PluridDocument,
// } from '../../data/interfaces';



interface DocumentsViewProperties {
}

const DocumentsView: React.FC<DocumentsViewProperties> = (properties) => {
    return (
        <StyledDocumentsView>
            documents view
        </StyledDocumentsView>
    );
}


export default DocumentsView;
