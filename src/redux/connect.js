import {userLoaded, userExpired, userExpiring} from './actions';
import {renewError, tokenError} from './actions';


export const getMapStateToProps = (config, location, stateKey='oidc')=> (state)=> ({
  config,
  url: location.href,
  state: location.hash,
  needsLogin: state[stateKey].loginRequired,
  needsLogout: state[stateKey].logoutRequired
});

export const mapDispatchToProps = (dispatch)=> ({
  onUserLoaded: (...args)=> dispatch(userLoaded(...args)),
  onUserExpired: (...args)=> dispatch(userExpired(...args)),
  onUserExpiring: (...args)=> dispatch(userExpiring(...args)),
  onSilentRenewError: (...args)=> dispatch(renewError(...args)),
  onSigninError: (...args)=> dispatch(renewError(...args)),
  onTokenError: (...args)=> dispatch(tokenError(...args))
});
