import {InMemoryWebStorage} from 'oidc-client/lib/oidc-client';
import {WebStorageStateStore} from 'oidc-client/lib/oidc-client';
import {document, localStorage} from './globals';


export class CookieStore {
  getItem(key) {
    const safeKey = encodeURIComponent(key);
    const value = document.cookie
      .split(';')
      .find((item)=> item.startsWith(`${safeKey}=`));

    if (value) {
      return decodeURIComponent(value.split(`${safeKey}=`)[1]);
    }
  }

  setItem(key, value) {
    const safeKey = encodeURIComponent(key);
    document.cookie = `${safeKey}=${encodeURIComponent(value)}`;
  }

  removeItem(key) {
    const safeKey = encodeURIComponent(key);
    document.cookie = `${safeKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}


export default ()=> {
  try {
    // Safari has a localStorage with no capacity when in private browsing mode,
    // which will cause the following throw an error.
    localStorage.setItem('test-ios-private-browsing', 'has-issues');
    localStorage.removeItem('test-ios-private-browsing');
    return {};
  } catch {
    return {
      // We need to fallback to using a cookie to store the current state
      // of the app, as it needs to survive a redirtect to the login page.
      stateStore: new WebStorageStateStore({store: new CookieStore()}),
      // We don't care much about the storing the current user data anywhere.
      // For one this has security implication, second we don't really need it
      // considering our tokens are rather short and a page reload will perform
      // a silent signin without too much delay.
      userStore: new WebStorageStateStore({store: new InMemoryWebStorage()})
    };
  }
};
