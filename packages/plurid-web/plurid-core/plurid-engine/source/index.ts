// #region module
export * from './modules';
export * from './functions';

// Top-level named exports of the routing classes (also available via the `routing`
// namespace). Named top-level exports let downstream packages re-export them with a
// nameable type — a namespace member of an external package gets inlined anonymously,
// tripping TS4094 on the classes' private members.
export { IsoMatcher, RouteParser } from './modules/routing';

// Top-level named export of the flat-config helper so consumers can `import` it directly
// (it's also reachable via the `general.configuration` namespace).
export { definePluridConfiguration } from './modules/general/configuration';
// #endregion module
