import {UserManager} from 'oidc-client/src/UserManager';


const processSilentRenew = ()=> {
  const mgr = new UserManager();
  mgr.signinSilentCallback();
};

processSilentRenew();

export default processSilentRenew;
