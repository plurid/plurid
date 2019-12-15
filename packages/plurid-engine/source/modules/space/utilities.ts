export const splitIntoGroups = <T>(
    data: T[],
    length: number,
): T[][] => {
    const initialArray = [...data];
    const groups: any[] = [];

    while (initialArray.length) {
        const group = initialArray.splice(0, length);
        groups.push(group);
    }

    return groups;
}
