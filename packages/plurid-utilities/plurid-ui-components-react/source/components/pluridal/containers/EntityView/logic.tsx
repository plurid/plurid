// #region module
export const createSearchTerms = (
    rows: any[],
    fields: string[],
) => (rows.map(
    (entity) => {
        const {
            id,
        } = entity;

        const data: string[] = [];

        for (const field of fields) {
            const term = entity[field];

            if (term && typeof term === 'string') {
                data.push(
                    term.toLowerCase().trim(),
                );
            }
        }

        return {
            id,
            data,
        };
    },
));
// #endregion module
