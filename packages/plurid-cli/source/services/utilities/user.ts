import store from '../store';



export const userLoggedIn = () => {
    return store.has('token') && store.has('refreshToken');
}
