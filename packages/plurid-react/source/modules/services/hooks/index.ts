import {
    useWindowEvent as _useWindowEvent,
    useGlobalKeyDown as _useGlobalKeyDown,
    useGlobalWheel as _useGlobalWheel,
} from './event';

import {
    useDebouncedCallback as _useDebouncedCallback,
} from './debounce';



export const useWindowEvent = _useWindowEvent;
export const useGlobalKeyDown = _useGlobalKeyDown;
export const useGlobalWheel = _useGlobalWheel;

export const useDebouncedCallback = _useDebouncedCallback;
