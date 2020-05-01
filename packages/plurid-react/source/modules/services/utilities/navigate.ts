import {
    PLURID_ROUTER_LOCATION_CHANGED,
} from '@plurid/plurid-data';



export const pluridRouterNavigate = (
    path: string,
) => {
    const event = new CustomEvent(
        PLURID_ROUTER_LOCATION_CHANGED,
        {
            detail: {
                path,
            },
        },
    );
    window.dispatchEvent(event);
}
