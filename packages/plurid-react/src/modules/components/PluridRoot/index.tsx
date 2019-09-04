import React, {
    useState,
    useContext,
    useEffect,
} from 'react';

import {
    StyledPluridRoot,
} from './styled';

import Context from '../../../App/View/context';

import PluridPlane from '../PluridPlane';

import {
    TreePage,
    PluridAppContext,
} from '../../data/interfaces';



interface PluridRootProperties {
    page: TreePage;
}

const PluridRoot: React.FC<PluridRootProperties> = (properties) => {
    const [childrenPlanes, setChildrenPlanes] = useState([] as JSX.Element[]);
    const context: PluridAppContext = useContext(Context);

    const {
        page,
    } = properties;

    const {
        pages,
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
                    const Page = _page.component.element;
                    plane = (
                        <PluridPlane
                            key={child.planeID}
                            page={_page}
                            planeID={child.planeID}
                            location={child.location}
                        >
                            <Page />
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

    useEffect(() => {
        // TODO: explore for optiptimizations
        // check if the plane is already in the array
        // or get a better dependency than the JSON stringification
        setChildrenPlanes([]);
        computeChildrenPlanes(page);
    }, [JSON.stringify(page)]);

    if (_page) {
        const Page = _page.component.element;
        return (
            <StyledPluridRoot>
                <PluridPlane
                    page={_page}
                    planeID={page.planeID}
                    location={location}
                >
                    <Page />
                </PluridPlane>

                {childrenPlanes}
            </StyledPluridRoot>
        );
    }

    return (
        <div></div>
    );
}


export default PluridRoot;
