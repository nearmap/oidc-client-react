import {localStorage, location, document, history} from './globals';

describe('globals', ()=> {
  it('exports globals', ()=> {
    // eslint-disable-next-line no-undef
    const window = global.window;

    expect(localStorage).toBe(window.localStorage);
    expect(location).toBe(window.location);
    expect(document).toBe(window.document);
    expect(history).toBe(window.history);
  });
});
