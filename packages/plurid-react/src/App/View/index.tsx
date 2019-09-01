import React, {
    // useState,
    useEffect,
    // useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import {
    PluridAppProperties,
} from '../../modules/data/interfaces';

import Context from './context';

import { debounce } from '../../modules/services/utilities/debounce';

import { AppState } from '../../modules/services/state/store';
// import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';

// import themes from '@plurid/apps.utilities.themes';



export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
}

interface ViewDispatchProperties {
    setConfiguration: typeof actions.configuration.setConfiguration;
    setPages: typeof actions.data.setPages;
    setDocuments: typeof actions.data.setDocuments;
    setViewSize: typeof actions.data.setViewSize;
}

type ViewProperties = ViewStateProperties & ViewDispatchProperties & ViewOwnProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const {
        appProperties,
        setConfiguration,
        setPages,
        setDocuments,
        setViewSize,
    } = properties;

    const {
        configuration,
        pages,
        documents,
    } = appProperties;


    useEffect(() => {
        const handleResize = debounce(() => {
            setViewSize({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }, 1500);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    });

    useEffect(() => {
        setConfiguration(configuration);

        // to store the pages and documents in context
        // and to keep in redux only the paths and the rest of the metadata
        console.log(pages);

        const _pages = pages && pages.map(page => {
            const _page = { ...page };
            delete _page.component;
            return _page;
        }) || [];
        console.log(_pages);
        setPages(_pages);

        const _documents = documents && documents.map(document => {
            const _documentPages = document.pages.map(documentPage => {
                const _page = { ...documentPage };
                delete _page.component;
                return _page;
            });
            return { ...document, pages: _documentPages};
        }) || [];
        // console.log(_documents);
        setDocuments(_documents);
    }, [configuration]);

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView>
            <GlobalStyle />

            <Context.Provider
                value={{
                    pages,
                    documents
                }}
            >
                {viewContainer}
            </Context.Provider>
        </StyledView>
    );
}


const mapStateToProps = (state: AppState): ViewStateProperties => ({
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    setConfiguration: (configuration: any) => dispatch(actions.configuration.setConfiguration(configuration)),
    setPages: (pages: any) => dispatch(actions.data.setPages(pages)),
    setDocuments: (documents: any) => dispatch(actions.data.setDocuments(documents)),
    setViewSize: (viewSize: any) => dispatch(actions.data.setViewSize(viewSize)),
});


export default connect(mapStateToProps, mapDispatchToProps)(View);
