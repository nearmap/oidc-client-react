import reducer from '../utils/reducer';

const DefaultState = {
  accessToken: null,
  claims: {},
  expired: null,
  error: null,
  pending: true,
  loginRequired: false,
  logoutRequired: false
};

export default reducer(DefaultState, {
  'oidc/user-loaded': (state, {claims, accessToken})=> ({
    ...state,
    claims,
    accessToken,
    error: null,
    expired: false,
    pending: false
  }),
  'oidc/user-expired': (state)=> ({
    ...state, claims: {}, expired: true
  }),
  'oidc/renew-error': (state)=> ({
    ...state, claims: {}, error: 'renew'
  }),
  'oidc/token-error': (state)=> ({
    ...state, claims: {}, error: 'token'
  }),
  'oidc/signin': (state)=> ({
    ...state, loginRequired: true
  }),
  'oidc/signout': (state)=> ({
    ...state, logoutRequired: true
  })
});
