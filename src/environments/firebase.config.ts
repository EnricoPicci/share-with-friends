import {AuthMethods, AuthProviders} from 'angularfire2';

export const firebaseConfig = {
    apiKey: 'AIzaSyBkDvFcJMq5ccJQkBUsBXEwZMAdbeN-fE8',
    authDomain: 'sharewithfriends-f0b95.firebaseapp.com',
    databaseURL: 'https://sharewithfriends-f0b95.firebaseio.com',
    storageBucket: 'gs://sharewithfriends-f0b95.appspot.com/',
    messagingSenderId: '59640657706'
};



export const authConfig = {
    provider: AuthProviders.Password,
    method: AuthMethods.Password
};
