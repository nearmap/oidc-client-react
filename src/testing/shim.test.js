
describe('global.requestAnimationFrame shim', ()=> {
  it('calls callback', async ()=> {
    const cb = jest.fn();

    // eslint-disable-next-line no-undef
    await global.requestAnimationFrame(cb);

    expect(cb).toHaveBeenCalledWith();
  });
});
