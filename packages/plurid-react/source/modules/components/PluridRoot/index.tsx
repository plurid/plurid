import React, {
    useState,
    useContext,
    useEffect,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../services/utilities/context';

import PluridPlane from '../PluridPlane';

import {
    TreePage,
    PluridContext
} from '@plurid/plurid-data';



interface PluridRootProperties {
    page: TreePage;
}

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const context: PluridContext = useContext(Context);
    console.log(context);

    const {
        pages,
        pageContext: PageContext,
        pageContextValue,
        documents,
    } = context;

    const {
        page,
    } = properties;

    const {
        location,
    } = page;

    const [childrenPlanes, setChildrenPlanes] = useState<JSX.Element[]>([]);

    const computeChildrenPlanes = (page: TreePage) => {
        if (page.children) {
            page.children.map(child => {
                const _page = pages[page.path];
                // const _page = pages.find((_page: any) => _page.path === child.path);

                let plane = (<></>);
                if (_page) {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Page = _page.component.element;
                    const properties = _page.component.properties || {};

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
                                        {...properties}
                                    />
                                ) : (
                                    <PageContext.Provider
                                        value={pageContextValue}
                                    >
                                        <Page
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

    // const pluridPage = pages.find(pluridPage => pluridPage.path === page.path);
    const activeDocument = documents['default'];
    const activePages = activeDocument.pages;

    const pluridPage = activePages[page.planeID];
    if (!pluridPage) {
        return (<></>);
    }

    const Page = pluridPage.component.element;
    const pageProperties = pluridPage.component.properties || {};

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
                            {...pageProperties}
                        />
                    ) : (
                        <PageContext.Provider
                            value={pageContextValue}
                        >
                            <Page
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


export default PluridRoot;
