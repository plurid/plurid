import React from 'react';

import './index.css';

import {
    PluridAppProperties,
} from '../modules/data/interfaces';

import ErrorPage from '../modules/components/ErrorPage';



const PluridApp: React.FC<PluridAppProperties> = (properties) => {
    const {
        configuration,
        pages,
        documents,
    } = properties;

    console.log(configuration);
    console.log(pages);
    console.log(documents);

    if (pages && !documents) {
        return (
            <div>
                plurid app pages
            </div>
        );
    }

    if (documents && !pages) {
        return (
            <div>
                plurid app documents
            </div>
        );
    }

    return (
        <ErrorPage error="the plurid' application must be either documents-based or pages-based" />
    );
}


export default PluridApp;
