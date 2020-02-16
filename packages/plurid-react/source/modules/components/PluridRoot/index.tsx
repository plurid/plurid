import React, {
    useState,
    useContext,
    useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../services/logic/context';

import PluridPlane from '../PluridPlane';

import {
    TreePage,
    PluridContext
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridRootOwnProperties {
    page: TreePage;
}

interface PluridRootStateProperties {
    activeDocumentID: string;
}

interface PluridRootDispatchProperties {
}

type PluridRootProperties = PluridRootOwnProperties
    & PluridRootStateProperties
    & PluridRootDispatchProperties;

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: PluridContext = useContext(Context);
    // console.log(context);

    const {
        pageContext: PageContext,
        pageContextValue,
        documents,
    } = context;

    const {
        /** own */
        page,

        /** state */
        activeDocumentID,
    } = properties;

    const {
        location,
    } = page;

    const [childrenPlanes, setChildrenPlanes] = useState<JSX.Element[]>([]);

    const computeChildrenPlanes = (page: TreePage) => {
        if (page.children) {
            page.children.map(child => {
                const _page = activePages[child.pageID];

                let plane = (<></>);
                if (_page && child.show) {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Page = _page.component.element;
                    const properties = _page.component.properties || {};
                    const pluridProperties = {
                        parameters: child.parameters || {},
                        query: {},
                    };

                    plane = (
                        <PluridPlane
                            key={child.planeID}
                            page={_page}
                            treePage={child}
                            planeID={child.planeID}
                            location={child.location}
                        >
                            {!PageContext
                                ? (
                                    <Page
                                        plurid={pluridProperties}
                                        {...properties}
                                    />
                                ) : (
                                    <PageContext.Provider
                                        value={pageContextValue}
                                    >
                                        <Page
                                            plurid={pluridProperties}
                                            {...properties}
                                        />
                                    </PageContext.Provider>
                                )
                            }
                        </PluridPlane>
                    );

                    setChildrenPlanes(planes => [...planes, plane]);
                }

                if (child.children) {
                    computeChildrenPlanes(child);
                }
            });
        }
    }

    /** Compute children planes */
    useEffect(() => {
        // TODO: explore for optimizations
        // check if the plane is already in the array
        // or get a better dependency than the JSON stringification
        setChildrenPlanes([]);
        computeChildrenPlanes(page);
    }, [
        JSON.stringify(page),
    ]);

    const activeDocument = documents[activeDocumentID];
    // console.log('activeDocument', activeDocument);
    const activePages = activeDocument.pages;
    // console.log('activePages', activePages);

    const pluridPage = activePages[page.pageID];
    // console.log('pluridPage', pluridPage);

    if (!pluridPage) {
        return (<></>);
    }

    const Page = pluridPage.component.element;
    // console.log(Page);

    const pageProperties = pluridPage.component.properties || {};
    const pluridProperties = {
        parameters: page.parameters || {},
        query: {},
    };

    return (
        <StyledPluridRoot>
            <PluridPlane
                page={pluridPage}
                treePage={page}
                planeID={page.planeID}
                location={location}
            >
                {!PageContext
                    ? (
                        <Page
                            plurid={pluridProperties}
                            {...pageProperties}
                        />
                    ) : (
                        <PageContext.Provider
                            value={pageContextValue}
                        >
                            <Page
                                plurid={pluridProperties}
                                {...pageProperties}
                            />
                        </PageContext.Provider>
                    )
                }
            </PluridPlane>

            {childrenPlanes}
        </StyledPluridRoot>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridRootStateProperties => ({
    activeDocumentID: selectors.space.getActiveDocumentID(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridRoot);
