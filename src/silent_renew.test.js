import {UserManager} from 'oidc-client/lib/oidc-client';

const mockUserManager = {
  signinSilentCallback: jest.fn()
};

jest.mock('oidc-client/lib/oidc-client', ()=> ({
  UserManager: jest.fn(()=> mockUserManager)
}));

describe('silent_renew', ()=> {

  it('creates a UserManager with config', ()=> {
    require('./silent_renew');

    expect(UserManager).toHaveBeenCalledWith();
    expect(mockUserManager.signinSilentCallback).toHaveBeenCalledWith();
  });
});
