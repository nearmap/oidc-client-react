import {document} from './globals';

import setupExpiryWorkaround from './expiry-workaround';


jest.mock('./globals', ()=> ({
  document: {addEventListener: jest.fn()}
}));


describe('workaround', ()=> {
  const userManager = {getUser: jest.fn()};
  const onUserExpired = jest.fn();

  it('registers visibilitychange handler', ()=> {
    setupExpiryWorkaround(userManager, onUserExpired);

    expect(document.addEventListener)
      .toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('handles expired user when document becomes unhidden', async ()=> {
    document.hidden = false;
    userManager.getUser.mockImplementation(()=> ({expired: true}));
    setupExpiryWorkaround(userManager, onUserExpired);

    const [[, handler]] = document.addEventListener.mock.calls;

    await handler();

    expect(onUserExpired).toHaveBeenCalledWith();
  });

  it('ignores when document is hidden', async ()=> {
    document.hidden = true;
    userManager.getUser.mockImplementation(()=> ({expired: true}));
    setupExpiryWorkaround(userManager, onUserExpired);

    const [[, handler]] = document.addEventListener.mock.calls;

    await handler();

    expect(onUserExpired).not.toHaveBeenCalled();
  });

  it('ignores when user is not expired', async ()=> {
    document.hidden = false;
    userManager.getUser.mockImplementation(()=> ({expired: false}));
    setupExpiryWorkaround(userManager, onUserExpired);

    const [[, handler]] = document.addEventListener.mock.calls;

    await handler();

    expect(onUserExpired).not.toHaveBeenCalled();
  });
});
