import { useEffect } from 'react';



export const useWindowEvent = (event: any, callback: any) => {
    useEffect(() => {
        window.addEventListener(event, callback, { passive: false });
        return () => window.removeEventListener(event, callback);
    }, [event, callback]);
};


export const useGlobalKeyDown = (callback: any) => {
    return useWindowEvent('keydown', callback);
}

export const useGlobalWheel = (callback: any) => {
    return useWindowEvent('wheel', callback);
}
