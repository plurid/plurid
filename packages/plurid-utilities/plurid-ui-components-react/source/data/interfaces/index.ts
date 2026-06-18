// #region module
export interface PluridUIDropdownSelectable {
    id: string;
    value: string;
}


export interface PluridUIEntityPillData {
    id: string;
    text?: string;
}



export type Small = 'small';
export type Normal = 'normal';
export type Large = 'large';

export type Sizes = Small | Normal | Large;


export interface ToolbarButton {
    type: any;
    text: string;
    icon: React.FC;
    loggedIn?: string;
    first?: boolean;
    last?: boolean;
}


export interface EntityViewSearchTerm {
    id: string,
    data: string[],
}


export interface EntityViewRefAttributes {
    getSearchTerms: () => EntityViewSearchTerm[];
    resetFilterValue: () => void;
}
// #endregion module
