import React from 'react';
import {UserManager} from 'oidc-client/lib/oidc-client';
import {shallow} from 'enzyme';

import {location, history} from './globals';

import setupExpiryWorkaround from './expiry-workaround.js';

import Oidc from './index';


const mockUserManager = {
  events: {
    addUserLoaded: jest.fn(),
    addSilentRenewError: jest.fn(),
    addAccessTokenExpired: jest.fn(),
    addAccessTokenExpiring: jest.fn(),
    addUserUnloaded: jest.fn()
  },
  signinRedirectCallback: jest.fn(),
  signinRedirect: jest.fn(),
  signoutRedirect: jest.fn(),
  signinSilent: jest.fn(),
  getUser: jest.fn()
};

jest.mock('oidc-client/lib/oidc-client', ()=> ({
  UserManager: jest.fn(()=> mockUserManager),
  Log: {}
}));

jest.mock('jwt-decode', ()=> (token)=> ({test: token}));

jest.mock('./globals', ()=> ({
  document: {addEventListener: jest.fn()},
  location: {pathname: 'test-path/'},
  history: {replaceState: jest.fn()}
}));

jest.mock('./expiry-workaround', ()=> jest.fn());


const anyFunc = expect.any(Function);

beforeEach(()=> {
  location.hash = '';
});


describe('<Oidc />', ()=> {
  const config = {};

  it('creates a UserManager with config', ()=> {
    shallow(<Oidc config={config} />);

    expect(UserManager).toHaveBeenCalledWith(config);
  });

  it('signs in silently if no token on URL', ()=> {
    shallow(<Oidc url='' />);

    expect(mockUserManager.signinSilent).toHaveBeenCalledWith();
  });

  it('reports silent signin error', ()=> {
    const onSigninError = jest.fn();
    const err = new Error('test');
    mockUserManager.signinSilent.mockImplementation(()=> {
      throw err;
    });

    shallow(<Oidc onSigninError={onSigninError} />);

    expect(onSigninError).toHaveBeenCalledWith(err);
  });

  it('delegates to signinRedirectCallback if tokens on URL', ()=> {
    const url = 'https://example.org/my-app/#id_token=token&access_token=token';

    shallow(<Oidc url={url} />);

    expect(mockUserManager.signinRedirectCallback).toHaveBeenCalledWith(url);
  });

  it('reports token error', ()=> {
    const onTokenError = jest.fn();
    const err = new Error('test');
    mockUserManager.signinRedirectCallback.mockImplementation(()=> {
      throw err;
    });
    const url = 'https://example.org/my-app/#id_token=token&access_token=token';

    shallow(<Oidc url={url} onTokenError={onTokenError} />);

    expect(onTokenError).toHaveBeenCalledWith(err);
  });

  it('signs out with redirect', ()=> {
    const oidc = shallow(<Oidc />);

    oidc.setProps({needsLogout: true});

    expect(mockUserManager.signoutRedirect).toHaveBeenCalledWith();
  });

  it('reports signout error', ()=> {
    const onSignoutRedirectError = jest.fn();
    const err = new Error('test');
    mockUserManager.signoutRedirect.mockImplementation(()=> {
      throw err;
    });
    const oidc = shallow(
      <Oidc onSignoutRedirectError={onSignoutRedirectError} />
    );

    oidc.setProps({needsLogout: true});

    expect(onSignoutRedirectError).toHaveBeenCalledWith(err);
  });

  it('reports sigin-redirect error', ()=> {
    const onSigninRedirectError = jest.fn();
    const err = new Error('test');
    mockUserManager.signinRedirect.mockImplementation(()=> {
      throw err;
    });
    const oidc = shallow(
      <Oidc onSigninRedirectError={onSigninRedirectError} />
    );

    oidc.setProps({needsLogin: true});

    expect(onSigninRedirectError).toHaveBeenCalledWith(err);
  });

  it('signs in with redirect', ()=> {
    const state = 'test-state';
    const oidc = shallow(<Oidc />);

    oidc.setProps({needsLogin: true, state});

    expect(mockUserManager.signinRedirect).toHaveBeenCalledWith({state});
  });
});


describe('<Oidc /> oidc-client events', ()=> {
  const {events} = mockUserManager;

  it('delegates user-loaded to props', ()=> {
    const onUserLoaded = jest.fn();
    shallow(<Oidc onUserLoaded={onUserLoaded} />);

    const [[loaded]] = events.addUserLoaded.mock.calls;
    loaded({access_token: 'token'}); // eslint-disable-line camelcase

    expect(onUserLoaded).toHaveBeenCalledWith({test: 'token'}, 'token');
  });

  it('resets URL when user loaded with state', ()=> {
    location.pathname = 'test-path/';
    shallow(<Oidc />);

    const [[loaded]] = events.addUserLoaded.mock.calls;
    loaded({state: '#state'});

    expect(
      history.replaceState
    ).toHaveBeenCalledWith(
      null, null, 'test-path/#state'
    );
  });

  it('resets URL when user loaded with an application state json object', ()=> {
    location.pathname = 'test-path/';
    shallow(<Oidc />);

    const [[loaded]] = events.addUserLoaded.mock.calls;
    loaded({state: JSON.stringify({hash: '#state'})});

    expect(
      history.replaceState
    ).toHaveBeenCalledWith(
      null, null, 'test-path/#state'
    );
  });

  it('resets URL when user loaded with state using custom stateToUrl', ()=> {
    shallow(<Oidc stateToUrl={(state)=> `test-${state}`} />);

    const [[loaded]] = events.addUserLoaded.mock.calls;
    loaded({state: 'state'}); // eslint-disable-line camelcase

    expect(history.replaceState).toHaveBeenCalledWith(null, null, 'test-state');
  });


  it('delegates user unloaded', ()=> {
    const onUserUnloaded= jest.fn();
    shallow(<Oidc onUserUnloaded={onUserUnloaded} />);

    const [[unloaded]] = events.addUserUnloaded.mock.calls;
    unloaded();

    expect(onUserUnloaded).toHaveBeenCalledWith();
  });

  it('delegates silent renew error', ()=> {
    const onSilentRenewError = jest.fn();
    const err = {};
    shallow(<Oidc onSilentRenewError={onSilentRenewError} />);

    const [[fire]] = events.addSilentRenewError.mock.calls;
    fire(err);

    expect(onSilentRenewError).toHaveBeenCalledWith(err);
  });

  it('delegates user expired', ()=> {
    const onUserExpired = jest.fn();
    shallow(<Oidc onUserExpired={onUserExpired} />);

    const [[expired]] = events.addAccessTokenExpired.mock.calls;
    expired();

    expect(onUserExpired).toHaveBeenCalledWith();
  });

  it('delegates user expiring', ()=> {
    const onUserExpiring= jest.fn();
    shallow(<Oidc onUserExpiring={onUserExpiring} />);

    const [[expiring]] = events.addAccessTokenExpiring.mock.calls;
    expiring();

    expect(onUserExpiring).toHaveBeenCalledWith();
  });
});


describe('<Oidc /> with expiry workaround', ()=> {
  it('sets up workaround', ()=> {
    shallow(<Oidc />);

    expect(setupExpiryWorkaround)
      .toHaveBeenCalledWith(mockUserManager, anyFunc);
  });

  it('handles user expiry', async ()=> {
    const onUserExpired = jest.fn();
    shallow(<Oidc onUserExpired={onUserExpired} />);

    const [[, expired]] = setupExpiryWorkaround.mock.calls;
    await expired();

    expect(onUserExpired).toHaveBeenCalledWith();
    expect(mockUserManager.signinSilent).toHaveBeenCalledWith();
  });
});
