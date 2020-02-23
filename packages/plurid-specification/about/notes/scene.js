// the pluridScene object that groups all the information about the scene

// the object should be created by parsing a .html file
// checking for <plurid-page> tags




let pluridScene = {
    metadata: {
        activePlurid: '',
        activeSheet: '',
        containers: 0,
        rootPages: [],
        rootSheets: [],
        pages: 0
    },
    content: {
        linkParentId: linkParentId,
        link: newBranch.link,
        branchId: newBranch.id,
        coordinates: {
            prevLinkX: prevLinkX,
            prevLinkY: prevLinkY,
            linkX: right,
            linkY: top,
            prevTransX: prevTransX,
            prevTransY: prevTransY,
            prevTransZ: prevTransZ,
            transX: transX,
            transY: transY,
            transZ: transZ,
            angleY: angleRotY
        },
        children: [],
        path: path
    },
    getBranchById: (branchId) => {
        return branchById;
    }
}
