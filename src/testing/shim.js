// See https://github.com/facebook/jest/issues/4545
// eslint-disable-next-line no-undef
global.requestAnimationFrame = async (callback)=> {
  await 'defer';
  callback();
};
