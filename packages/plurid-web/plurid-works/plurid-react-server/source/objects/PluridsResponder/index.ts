// #region module
/**
 * Parses the elements of a fully-defined pluriversal link.
 *
 * From
 * `https://example.com://a/route://a/space://a/page'`
 * to
 * `['https', 'example.com', 'a/route', 'a/space, 'a/page']`
 * to
 * ```
 * link = {
 *   protocol: 'https',
 *   origin: 'example.com',
 *   route: 'a/route',
 *   space: 'a/space',
 *   page: 'a/page',
 * };
 * ```
 *
 * The slash `/` between the routes/spaces/pages works just as in the browser path.
 * In-route slashes, or any other special characters, will be standard encoded.
 *
 * Assumes that there are no queries or fragments,
 * and that the path is complete with protocol, origin, route, space, page.
 *
 * If there is only one space on the route, then it's name is `default`.
 *
 * @param path
 */
export const parseLink = (
    path: string,
) => {
    const split = path.split('://');

    const link = {
        protocol: split[0],
        origin: split[1],
        route: split[2],
        space: split[3],
        page: split[4],
    };

    return link;
}


class PluridsResponder {
    private plurids: Map<string, any> = new Map();

    constructor(
    ) {
        this.findPlurids();
    }

    public search(
        url: string,
    ) {
        // check if the url is a valid /plurids url
        // plurids/<route>/<space>/<page>
        // plurids/index/12345/54321


        // check if there is a cached version
        if (url) {
            return '';
        }


        // return response
        return;
    }


    private findPlurids() {

    }
}
// #endregion module



// #region exports
export default PluridsResponder;
// #endregion exports
