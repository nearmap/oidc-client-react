import {UserManager} from 'oidc-client/src/UserManager';

const mockUserManager = {
  signinSilentCallback: jest.fn()
};

jest.mock('oidc-client/src/UserManager', ()=> ({
  UserManager: jest.fn(()=> mockUserManager)
}));

describe('silent_renew', ()=> {

  it('creates a UserManager with config', ()=> {
    require('./silent_renew');

    expect(UserManager).toHaveBeenCalledWith();
    expect(mockUserManager.signinSilentCallback).toHaveBeenCalledWith();
  });
});
