import path from 'path';



const deployCommand = async (
    directory: string | undefined,
) => {
    // check if user is loggedin

    const resolvedDirectory = directory
        ? path.join(__dirname, directory)
        : process.cwd();

    // check if there is a plurid.app.yaml file and parse it

    // upload files

    // wait for deployment to finish

    console.log('deploy');
    console.log(directory);
}


export default deployCommand;
