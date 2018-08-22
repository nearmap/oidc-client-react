import React from 'react';
import shallow from 'enzyme';

import Oidc from '../';


const ConnectedOidc = connect(
  Oidc,
  getMapStateToProps(),
  mapDispatchToProps
);


describe('connect(Oidc)', ()=> {
  shallow(
    <Provider store={store}>
      <ConnectedOidc />
    </Provider>
  );
});
