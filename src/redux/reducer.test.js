import {createStore, combineReducers} from 'redux';

import {signin, signout} from './actions';
import {signinRedirectError, signoutRedirectError} from './actions';
import {userLoaded, userUnloaded, userExpired, userExpiring} from './actions';
import {renewError, tokenError} from './actions';

import oidc from './reducer';

let store = null;

beforeEach(()=> {
  const initialState = {};
  store = createStore(
    combineReducers({oidc}),
    initialState
  );
});


describe('redux-reducer signin-signout', ()=> {
  it('initializes store', ()=> {
    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles signin', ()=> {
    store.dispatch(signin());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: null,
      loginRequired: true,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles signout', ()=> {
    store.dispatch(signout());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: null,
      loginRequired: false,
      logoutRequired: true,
      pending: true
    });
  });

  it('handles signinRedirectError', ()=> {
    store.dispatch(signinRedirectError());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null, // TODO: shouldn't this be set?
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles signoutRedirectError', ()=> {
    store.dispatch(signoutRedirectError());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null, // TODO: shouldn't this be set?
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });
});


describe('redux-reducer token handling', ()=> {
  it('handles userLoaded', ()=> {
    store.dispatch(userLoaded({test: 'value'}, 'token'));

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: 'token',
      claims: {test: 'value'},
      error: null,
      expired: false,
      loginRequired: false,
      logoutRequired: false,
      pending: false
    });
  });

  it('handles userUnloaded', ()=> {
    store.dispatch(userUnloaded());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles userExpired', ()=> {
    store.dispatch(userExpired());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: true,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles userExpiring', ()=> {
    store.dispatch(userExpiring());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: null,
      expired: null, // TODO: should this be false?
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles renewError', ()=> {
    store.dispatch(renewError());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: 'renew',
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });

  it('handles tokenError', ()=> {
    store.dispatch(tokenError());

    expect(
      store.getState().oidc
    ).toEqual({
      accessToken: null,
      claims: {},
      error: 'token',
      expired: null,
      loginRequired: false,
      logoutRequired: false,
      pending: true
    });
  });
});
