import { AuthService } from './auth.service';

export const userEmail = 'test.login@my.com';
export const userPwd = 'mypassw';
export const userName = 'my name5';

export const createUserAndLogin = (authService: AuthService, email = userEmail)  => {
    authService.signUp(email, userPwd, userName).then(
        () => {
            authService.logout().then(() => {
                authService.login(email, userPwd).then(() => {
                console.log('login of user complete', userEmail);
                });
            });
        },
        err => {
            authService.login(email, userPwd).then(() => {
                console.log('login of user complete', userEmail);
            });
        });
    };

export function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
