// To add a new view:

// 1. Add a type.
export type ViewIndex = 'index';
export type ViewNotFound = 'notFound';
export type ViewStatic = 'static';
export type ViewPage = 'page';


// 2. Add type to ViewType.
export type ViewType = ViewIndex
    | ViewNotFound
    | ViewStatic
    | ViewPage;


// 3. Create a const for the view type.
export const viewIndex: ViewIndex = 'index';
export const viewNotFound: ViewNotFound = 'notFound';
export const viewStatic: ViewStatic = 'static';
export const viewPage: ViewPage = 'page';


// 4. Add type to the view interface.
export interface View {
    index: ViewIndex;
    notFound: ViewNotFound;
    static: ViewStatic;
    page: ViewPage;
}


// 5. Add const to the view object.
const view: View = {
    index: viewIndex,
    notFound: viewNotFound,
    static: viewStatic,
    page: viewPage,
}


export default view;
