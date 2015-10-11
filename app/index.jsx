import 'babel-core/polyfill';
import "../assets/css/reactoplayer.scss";

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import React from "react";
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import PlayerApp from "./reducers";
import Player from "./components/Player";

import { fetchDataMiddleware } from "./actions_network";

main();

function main() {
  const player = document.createElement('div');
  document.body.appendChild(player);

  const loggerMiddleware = createLogger();

  let createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware, // lets use dispatch() functions
    fetchDataMiddleware,
    loggerMiddleware,
  )(createStore);

  let store = createStoreWithMiddleware(PlayerApp);
  React.render(
    <Provider store={store}>
      {() => <Player />}
    </Provider>, player
  );
}

  // React.render(
  //   <Player
  //     playlist={play_list}
  //     volume={volume}
  //   />, player
// <Provider store={store}>
//   {() => <Player />}
// </Provider>,
