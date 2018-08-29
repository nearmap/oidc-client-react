import {UserManager} from 'oidc-client/lib/oidc-client';


const processSilentRenew = ()=> {
  const mgr = new UserManager();
  mgr.signinSilentCallback();
};

processSilentRenew();

export default processSilentRenew;
