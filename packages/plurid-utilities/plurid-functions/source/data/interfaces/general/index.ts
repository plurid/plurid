// #region module
/**
 * Based on https://stackoverflow.com/a/56416192/6639124
 */
export type AllValues<T extends Record<PropertyKey, PropertyKey>> = {
    [P in keyof T]: { key: P, value: T[P] }
}[keyof T]


export type InvertResult<T extends Record<PropertyKey, PropertyKey>> = {
    [P in AllValues<T>['value']]: Extract<AllValues<T>, { value: P }>['key']
}


export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};


/**
 * Based on https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
 */
export type NestedKeyOf<ObjectType extends object> =
    {
        [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
            : `${Key}`
    }[keyof ObjectType & (string | number)];


/**
 * https://github.com/ghoullier/awesome-template-literal-types#dot-notation-string-type-safe
 */
export type ExtractPathsLogic<T, Key extends keyof T> = Key extends string
    ? T[Key] extends Record<string, any>
      ? | `${Key}.${ExtractPathsLogic<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
      : never
    : never;

export type ExtractPathsRecursion<T> = ExtractPathsLogic<T, keyof T> | keyof T;

export type ExtractPaths<T> = ExtractPathsRecursion<T> extends string | keyof T
    ? ExtractPathsRecursion<T>
    : keyof T;


export type Split<
    S extends string,
    D extends string,
> = S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S];


export type RootKey<S extends string> = Split<S, '.'>['length'] extends 1 ? true : false;


export type RecursiveOmit<
    ObjectType extends object,
    Omits extends NestedKeyOf<ObjectType> | NestedKeyOf<ObjectType>[],
> = any;
// #endregion module
