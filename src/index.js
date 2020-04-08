import React from 'react';
import PropTypes from 'prop-types';
import jwtDecode from 'jwt-decode';
import {UserManager} from 'oidc-client/lib/oidc-client';

import {location, history} from './globals';

import setupExpiryWorkaround from './expiry-workaround.js';


const containsAccessToken = /\baccess_token=.+/;
const containsIdToken = /\bid_token=.+/;
const defaultSinginRetries = 5;

export default class Oidc extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    url: PropTypes.string,
    signinRetries: PropTypes.number,
    state: PropTypes.string,
    needsLogin: PropTypes.bool,
    needsLogout: PropTypes.bool,
    stateToUrl: PropTypes.func,
    onUserLoaded: PropTypes.func,
    onUserExpired: PropTypes.func,
    onUserExpiring: PropTypes.func,
    onUserUnloaded: PropTypes.func,
    onSigninError: PropTypes.func,
    onSigninRedirectError: PropTypes.func,
    onSignoutRedirectError: PropTypes.func,
    onSilentRenewError: PropTypes.func,
    onTokenError: PropTypes.func
  };

  setupEventDispatchers() {
    const {events} = this.userManager;

    events.addUserLoaded((user)=> this.handleUserLoaded(user));
    events.addUserUnloaded(()=> this.handle(this.props.onUserUnloaded));
    events.addSilentRenewError(
      (err)=> this.handle(this.props.onSilentRenewError, err)
    );
    // TODO: should we automatically signin in like we do with the workaround?
    events.addAccessTokenExpired(()=> this.handle(this.props.onUserExpired));
    events.addAccessTokenExpiring(()=> this.handle(this.props.onUserExpiring));
  }

  async signinSilent() {
    try {
      await this.userManager.signinSilent();
    } catch (err) {
      this.handle(this.props.onSigninError, err);
    }
  }

  async signinSilentWithRetries(signinRetries) {
    let retryStep = 0;

    while (retryStep < signinRetries) {
      retryStep += 1;
      try {
        return await this.userManager.signinSilent();
      } catch (err) {
        // This may fail while the OS reconnects to a network
        // after waking up and we were a bit too quick trying
        // to perform the signin. We will retry a few times.
        if (retryStep >= signinRetries) {
          this.handle(this.props.onSigninError, err);
        }
      }
    }
  }

  async checkTokenUrl(url) {
    try {
      await this.userManager.signinRedirectCallback(url);
    } catch (err) {
      this.handle(this.props.onTokenError, err);
    }
  }

  async signinRedirect(...args) {
    try {
      await this.userManager.signinRedirect(...args);
    } catch (err) {
      this.handle(this.props.onSigninRedirectError, err);
    }
  }

  async signoutRedirect() {
    try {
      await this.userManager.signoutRedirect();
    } catch (err) {
      this.handle(this.props.onSignoutRedirectError, err);
    }
  }

  handle(handler, ...args) {
    if (handler) {
      handler(...args);
    }
  }

  async handleUserExpired() {
    const {onUserExpired, signinRetries} = this.props;

    this.handle(onUserExpired);
    await this.signinSilentWithRetries(signinRetries || defaultSinginRetries);
  }

  handleUserLoaded(user) {
    const accessToken = user.access_token;
    const claims = jwtDecode(accessToken);
    let {state} = user;

    if (state !== undefined) {
      // check if state is a stringified json object which contains a
      // `hash` field storing the URL hash fragment
      if (state.charAt(0) === '{') {
        state = JSON.parse(state);
        state = state.hash;
      }

      // when we come back from a signinRedirect we should
      // remove the token data from the URL and replace it with the
      // state we had before the user was redirected away from the app
      const url = typeof this.props.stateToUrl === 'function'
        ? this.props.stateToUrl(state)
        : `${location.pathname}${state}`;
      history.replaceState(null, null, url);
    }

    this.handle(this.props.onUserLoaded, claims, accessToken);
  }

  async componentDidMount() {
    const {config, url, state} = this.props;
    this.userManager = new UserManager(config);

    this.setupEventDispatchers();
    setupExpiryWorkaround(this.userManager, ()=> this.handleUserExpired());

    if (containsAccessToken.test(url) && containsIdToken.test(url)) {
      // Use user if already available in local store to avoid
      // an inconvenient `Error: No matching state found in storage`
      // exception due to a racing condition where user gets removed
      // from local store before it can be used by
      // userManager.signinRedirectCallback() logic in this.checkTokenUrl()
      // ---
      // logic removing user from local storage:
      // https://github.com/IdentityModel/oidc-client-js/blob/96c45ba9bd6b8d87f0de132306170dbbf7898140/src/OidcClient.js#L116
      // issue description:
      // https://github.com/IdentityModel/oidc-client-js/issues/93
      const user = await this.userManager.getUser();
      if (user) {
        user.state = state;

        // Consider the access token supplied by the URL fragment coming from
        // the OIDC handler at root as the source of truth. Override current
        // access token hold in local store as potentially expired or reflecting
        // a wrong state
        const urlFragment = url.split('#')[1];
        // eslint-disable-next-line camelcase
        user.access_token =
        // eslint-disable-next-line no-undef
          new URLSearchParams(urlFragment).get('access_token');

        this.handleUserLoaded(user);
      } else {
        await this.checkTokenUrl(url);
      }
    } else {
      await this.signinSilent();
    }
  }

  componentDidUpdate() {
    const {state, needsLogin, needsLogout} = this.props;

    if (needsLogout) {
      this.signoutRedirect();
    }

    if (needsLogin) {
      this.signinRedirect({state});
    }
  }

  render() {
    return null;
  }
}
