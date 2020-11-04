import store from '../services/store';



const logoutCommand = async () => {
    const user = store.get('user');

    if (!user) {
        console.log(`\n\tNo user logged in. Run the 'authenticate' command:`);
        console.log('\n\t\tplurid authenticate\n');
        return;
    }

    store.delete('user');
    store.delete('token');
    store.delete('refreshToken');

    console.log(`\n\tLogged out from user ${user.username}.\n`);
}


export default logoutCommand;
