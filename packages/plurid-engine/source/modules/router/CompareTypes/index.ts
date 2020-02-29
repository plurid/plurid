export type CompareTypeEqual = '==';
export type CompareTypeEqualLessThan = '<=';
export type CompareTypeLessThan = '<';
export type CompareTypeEqualGreaterThan = '>=';
export type CompareTypeGreaterThan = '>';

export type CompareType = CompareTypeEqual
    | CompareTypeEqualLessThan
    | CompareTypeLessThan
    | CompareTypeEqualGreaterThan
    | CompareTypeGreaterThan;

export interface ICompareTypes {
    equal: '==',
    equalLessThan: '<=',
    lessThan: '<',
    equalGreaterThan: '>=',
    greaterThan: '>',
}

export const compareTypes: ICompareTypes = {
    equal: '==',
    equalLessThan: '<=',
    lessThan: '<',
    equalGreaterThan: '>=',
    greaterThan: '>',
};
