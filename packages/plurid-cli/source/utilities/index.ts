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
                (error, stdout, stderr) => {
                    if (error) {
                        console.warn(error);
                    }

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
