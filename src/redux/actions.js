
export const signin = ()=> ({
  type: 'oidc/signin'
});

export const signout = ()=> ({
  type: 'oidc/signout'
});

export const userLoaded = (claims, accessToken)=> ({
  type: 'oidc/user-loaded',
  claims,
  accessToken
});

export const userExpiring = ()=> ({
  type: 'oidc/user-expiring'
});

export const userExpired = ()=> ({
  type: 'oidc/user-expired'
});

export const userUnloaded = ()=> ({
  type: 'oidc/user-unloaded'
});

export const tokenError = (err, url)=> ({
  type: 'oidc/token-error',
  err,
  url
});

export const signinRedirectError = (err)=> ({
  type: 'oidc/signin-redirect-error',
  err
});

export const signoutRedirectError = (err)=> ({
  type: 'oidc/signout-redirect-error',
  err
});

export const renewError = (err)=> ({
  type: 'oidc/renew-error',
  err
});
