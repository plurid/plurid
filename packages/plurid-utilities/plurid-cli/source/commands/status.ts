import store from '../services/store';



const statusCommand = async () => {
    const user = store.get('user');

    if (!user) {
        console.log('\n\tUser not authenticated. Run the \'authenticate\' command:');
        console.log('\n\t\tplurid authenticate\n');
        return;
    }

    console.log(`\n\tLogged in as ${user.username}.\n`);
}


export default statusCommand;
