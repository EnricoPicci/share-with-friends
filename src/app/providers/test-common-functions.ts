import { AuthService } from './auth.service';

export const userEmail = 'test.login@my.com';
export const userPwd = 'mypassw';
export const userName = 'my name5';

export const createUserAndLogin = (authService: AuthService, email = userEmail, name = userName)  => {
    authService.signUp(email, userPwd, name).then(
        () => {
            authService.logout().then(() => {
                authService.login(email, userPwd).then(() => {
                console.log('login of user complete', email);
                });
            });
        },
        err => {
            authService.login(email, userPwd).then(() => {
                console.log('login of user complete', email);
            });
        });
    };

export const login = (authService: AuthService, email = userEmail)  => {
    authService.login(email, userPwd).then(() => {
        console.log('login of user complete', email);
    });
};

export function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
