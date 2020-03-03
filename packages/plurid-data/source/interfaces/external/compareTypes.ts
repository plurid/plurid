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


export interface CompareTypes {
    equal: CompareTypeEqual;
    equalLessThan: CompareTypeEqualLessThan;
    lessThan: CompareTypeLessThan;
    equalGreaterThan: CompareTypeEqualGreaterThan;
    greaterThan: CompareTypeGreaterThan;
}
