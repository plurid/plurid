import React from 'react';

import {
    renderToString,
} from 'react-dom/server';

import {
    PluridPartialConfiguration,
    PluridPage,
    PluridDocument,
    PluridView,
} from '@plurid/plurid-data';

import {
    space,
} from '@plurid/plurid-engine';

import computeCommonConfiguration from '../configuration';

// import PluridRoot from '../../../components/PluridRoot';



export interface ServerApplicationData {
    pages: PluridPage[],
    view: string[] | PluridView[],
    documents: PluridDocument[],
    configuration: PluridPartialConfiguration,
}


/**
 * Render application state and string of elements for Server-Side Rendering.
 *
 * @param pages
 * @param view
 * @param documents
 * @param configuration
 */
export const serverComputeApplication = (
    data: ServerApplicationData,
): any => {
    const {
        pages,
        view,
        documents,
        configuration,
    } = data;

    // determine if pages or document based

    // index pages

    // create tree pages

    // create tree

    // render tree



    const commonConfiguration = computeCommonConfiguration(configuration);

    const spaceTree = new space.Tree({
        pages: [],
        configuration: commonConfiguration,
        view,
    });
    const tree = spaceTree.compute();

    const Roots = () => (
        <>
            render PluridRoot
            {/* <PluridRoot
                page={{}}
            /> */}
        </>
    );

    const renderedString = renderToString(<Roots />);

    return {
        state: {
            tree,
        },
        stringed: renderedString,
    };
}
