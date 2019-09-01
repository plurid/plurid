export function debounce(fn: any, ms: number) {
    let timer: number | undefined;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(function(this: any) {
            timer = undefined;
            fn.apply((this, arguments));
        }, ms);
    };
}
