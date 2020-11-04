import {
    exec,
    execSync,
} from 'child_process';



export const programHasCommand = (
    argv: string[],
) => {
    return !!argv.slice(2).length;
}



/**
 * Executes a shell command and return it as a Promise.
 *
 * @param command
 */
export const executeCommand = (
    command: string,
    options?: {
        cwd: string;
    },
) => {
    return new Promise(
        (resolve, _) => {
            exec(
                command,
                {
                    cwd: options?.cwd || process.cwd(),
                },
                (_, stdout, stderr) => {
                    resolve(stdout? stdout : stderr);
                },
            );
        },
    );
}


export const executeCommandSameTerminal = (
    command: string,
    options?: {
        cwd: string;
    },
) => {
    execSync(
        command,
        {
            cwd: options?.cwd || process.cwd(),
            stdio: 'inherit',
        },
    );
}



export const checkPackageInstalledGlobally = async (
    packageName: string,
) => {
    try {
        const command = `npm ls -g ${packageName} --depth 0`;
        const result = await executeCommand(command);

        if ((result as string).includes('-- (empty)')) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}
