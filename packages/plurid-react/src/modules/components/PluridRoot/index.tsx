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
    const [childrenPlanes, setChildrenPlanes] = useState([] as JSX.Element[]);
    const context: PluridContext = useContext(Context);

    const {
        page,
    } = properties;

    const {
        pages,
        pagesContext: PagesContext,
    } = context;

    const {
        location,
    } = page;

    const _page = pages.find((_page: any) => _page.path === page.path);

    const computeChildrenPlanes = (page: TreePage) => {
        if (page.children) {
            page.children.map(child => {
                const _page = pages.find((_page: any) => _page.path === child.path);

                let plane = (<></>);
                if (_page) {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Page = _page.component.element;
                    const properties = _page.component.properties || {};

                    if (!PagesContext) {
                        plane = (
                            <PluridPlane
                                key={child.planeID}
                                page={_page}
                                treePage={child}
                                planeID={child.planeID}
                                location={child.location}
                            >
                                <Page
                                    {...properties}
                                />
                            </PluridPlane>
                        );
                    }

                    if (PagesContext) {
                        plane = (
                            <PluridPlane
                                key={child.planeID}
                                page={_page}
                                treePage={child}
                                planeID={child.planeID}
                                location={child.location}
                            >
                                <PagesContext.Provider
                                    value={{}}
                                >
                                    <Page
                                        {...properties}
                                    />
                                </PagesContext.Provider>
                            </PluridPlane>
                        );
                    }

                    setChildrenPlanes(planes => [...planes, plane]);
                }

                if (child.children) {
                    computeChildrenPlanes(child);
                }
            });
        }
    }

    useEffect(() => {
        // TODO: explore for optimizations
        // check if the plane is already in the array
        // or get a better dependency than the JSON stringification
        setChildrenPlanes([]);
        computeChildrenPlanes(page);
    }, [JSON.stringify(page)]);

    if (_page) {
        // console.log('rerender PluridRoot');
        const Page = _page.component.element;
        const properties = _page.component.properties || {};
        return (
            <StyledPluridRoot>
                <PluridPlane
                    page={_page}
                    treePage={page}
                    planeID={page.planeID}
                    location={location}
                >
                    <Page
                        {...properties}
                    />
                </PluridPlane>

                {childrenPlanes}
            </StyledPluridRoot>
        );
    }

    return (<></>);
}


export default PluridRoot;
