import {localStorage, document} from './globals';
import getOidcStores, {CookieStore} from './oidc-stores';


jest.mock('./globals', ()=> ({
  document: {

  },
  localStorage: {
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
}));


describe('CookieStore()', ()=> {

  it('updates cookie when setItem()', ()=> {
    const store = new CookieStore();

    store.setItem('foobar', 'spam');

    expect(document.cookie).toBe('foobar=spam');
  });

  it('updates cookie when removeItem()', ()=> {
    const store = new CookieStore();
    store.setItem('foobar', 'spam');

    store.removeItem('foobar');

    expect(document.cookie)
      .toBe('foobar=; expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('gets item from', ()=> {
    const store = new CookieStore();
    store.setItem('foobar', 'ham & spam');

    const value = store.getItem('foobar');

    expect(value).toBe('ham & spam');
  });

  it('returns nothing if item not found', ()=> {
    const store = new CookieStore();
    const value = store.getItem('no-such-key');

    expect(value).toBe(undefined);
  });
});

describe('oidc-stores', ()=> {
  it('gets custom stores if localStorage throws errors', ()=> {
    localStorage.setItem.mockImplementation(()=> {
      throw new Error();
    });
    const {userStore, stateStore} = getOidcStores();

    expect(userStore).not.toBe(undefined);
    expect(stateStore).not.toBe(undefined);
  });

  it('does not get custom stores if localStorage is OK', ()=> {
    localStorage.setItem.mockImplementation(()=> null);

    const {userStore, stateStore} = getOidcStores();

    expect(userStore).toBe(undefined);
    expect(stateStore).toBe(undefined);
  });
});
