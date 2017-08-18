import {document} from './globals';

/*
  The timer used by oidc-client for issuing a silent-renew does not work well
  for when a computer wakes from sleep and the token has meanwhile expired or
  is currently expiring.
  See Point 7. at https://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-settimeout

  This means the refresh of a token does not happen in time and the application
  does not get notified and will operate with an expired token.

  To work around this we add an event listener on the document which gets
  called whenever the user switches to the page/tab/window.
 */
export default (userManager, onUserExpired)=> {
  document.addEventListener('visibilitychange', async ()=> {
    // we only care when the user switches to the page.
    if (document.hidden === false) {
      // Getting the user will re-initialize all access-token events and the
      // associate timers to implement expiry
      const user = await userManager.getUser();

      if (user && user.expired) {
        // If the token has already expired, there won't be any new events
        // coming from oidc-client, so we need to handle this manually.
        onUserExpired();
      }
    }
  });
};
