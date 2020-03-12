export const programHasCommand = (
    argv: string[],
) => {
    return !!argv.slice(2).length;
}
