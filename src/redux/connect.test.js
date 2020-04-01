import {getMapStateToProps, mapDispatchToProps} from './connect';
import {userLoaded, userExpired, userExpiring} from './actions';
import {renewError, tokenError} from './actions';


describe('connect', ()=> {
  it('maps state to props', ()=> {
    const config = 'test-config';
    const location = {href: 'test-href', hash: 'test-hash'};
    const state = {oidc: {loginRequired: true, logoutRequired: false}};

    const mapStateToProps = getMapStateToProps(config, location);

    expect(
      mapStateToProps(state)
    ).toEqual({
      config,
      url: 'test-href',
      state: 'test-hash',
      needsLogin: true,
      needsLogout: false
    });
  });


  it('maps state to props using custom store key', ()=> {
    const config = 'test-config';
    const location = {href: 'test-href', hash: 'test-hash'};
    const state = {custom: {loginRequired: true, logoutRequired: false}};

    const mapStateToProps = getMapStateToProps(config, location, 'custom');

    expect(
      mapStateToProps(state)
    ).toEqual({
      config,
      url: 'test-href',
      state: 'test-hash',
      needsLogin: true,
      needsLogout: false
    });
  });


  it('maps dispatch to props', ()=> { // eslint-disable-line max-statements
    const dispatch = jest.fn();
    const args = ['test-arg1', 'test-arg2'];

    const props = mapDispatchToProps(dispatch);

    props.onUserLoaded(...args);
    expect(dispatch).toHaveBeenLastCalledWith(userLoaded(...args));
    props.onUserExpired(...args);
    expect(dispatch).toHaveBeenLastCalledWith(userExpired(...args));
    props.onUserExpiring(...args);
    expect(dispatch).toHaveBeenLastCalledWith(userExpiring(...args));
    props.onSilentRenewError(...args);
    expect(dispatch).toHaveBeenLastCalledWith(renewError(...args));
    props.onSigninError(...args);
    expect(dispatch).toHaveBeenLastCalledWith(renewError(...args));
    props.onTokenError(...args);
    expect(dispatch).toHaveBeenLastCalledWith(tokenError(...args));
  });
});
