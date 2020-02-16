export type CompareTypeEqual = '==';
export type CompareTypeEqualLessThan = '<=';
export type CompareTypeLessThan = '<';
export type CompareTypeEqualGreaterThan = '>=';
export type CompareTypeGreaterThan = '>';

export type CompareTypes = CompareTypeEqual
    | CompareTypeEqualLessThan
    | CompareTypeLessThan
    | CompareTypeEqualGreaterThan
    | CompareTypeGreaterThan;

export interface ICompareTypes {
    equal: '==',
    euqalLessThan: '<=',
    lessThan: '<',
    equalGreaterThan: '>=',
    greaterThan: '>',
}

export const compareTypes: ICompareTypes = {
    equal: '==',
    euqalLessThan: '<=',
    lessThan: '<',
    equalGreaterThan: '>=',
    greaterThan: '>',
};
