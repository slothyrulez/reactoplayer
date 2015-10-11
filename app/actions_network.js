import { SERVER_URL, SONGS_API_URL } from "./settings"

import createOneShot from 'redux-middleware-oneshot';
import fetch from 'isomorphic-fetch';

// ACTION TYPES
// NETWORK
export const SONGS_FETCH = 'SONGS_FETCH';
export const SONGS_ENDFETCH = 'SONGS_ENDFETCH';
export const SONGS_RECEIVE = 'SONGS_RECEIVE';
export const SONGS_FETCH_ERR = 'SONGS_FETCH_ERR';

export const SONG_DATA_FETCH = 'SONG_DATA_FETCH';
export const SONG_DATA_ENDFETCH = 'SONG_DATA_ENDFETCH';
export const SONG_DATA_RECEIVE = 'SONG_DATA_RECEIVE';
export const SONG_DATA_FETCH_ERR = 'SONG_DATA_FETCH_ERR';


// NETWORK FECTH
export function fetchSongs(bool) {
  return { type: SONGS_FETCH, bool };
}

export function endfetchSongs(bool) {
  return { type: SONGS_ENDFETCH, bool };
}

export function receiveSongs(json) {
  return { type: SONGS_RECEIVE, json, receivedAt: Date.now() };
}

export function errorFetchSong(err) {
  return { type: SONGS_FETCH_ERR, err, message: err.message || "SONGS_FETCH_ERR" };
}

export function fetchDataSong(bool) {
  return { type: SONG_DATA_FETCH, bool };
}

export function endFetchDataSong(bool) {
  return { type: SONG_DATA_ENDFETCH, bool };
}

export function receiveDataSong(data) {
  return {
    type: SONG_DATA_RECEIVE,
    dataUrl: data.dataUrl,
    fetchedData: true,
    uuid: data.uuid,
    receivedAt: Date.now()
  };
}

export function errorFetchDataSong(err) {
  return { type: SONG_DATA_FETCH_ERR, err, message: err.message || "SONG_DATA_FETCH_ERR" };
}

function fetchSongsHelper(songs) {
  return dispatch => {
    dispatch(fetchSongs(true));
    return fetch(SERVER_URL + SONGS_API_URL, {mode: 'cors'})
      .then(function(response) {
        if (response.status !== 200) {
          dispatch(errorFetchSong({"message": response.status}));
          return Promise.resolve(); // Nothing to wait for
        }
        response.json().then(function(data) {
          console.log("fetch song helper", data);
          dispatch(receiveSongs(data));
          dispatch(endfetchSongs(true));
        });
      }).catch(function(err) {
        console.log("FETCH ERROR : ", err);
        dispatch(errorFetchSong(err));
      });
  };
}

function shouldFetchSongs(state) {
  if (!state.playlist.length) {
    return true;
  } else if (state.fetching) {
    return false;
  }
}

export function fetchIfNeeddedSongsThunk(songs) {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return (dispatch, getState) => {
    if (shouldFetchSongs(getState())) {
      return dispatch(fetchSongsHelper(songs));
    } else {
      return Promise.resolve(); // Nothing to wait for
    }
  };
}

function fetchDataSongHelper(song) {
  return dispatch => {
    console.log(worker);
    if (worker_retrieve_start(song)){
      dispatch(fetchDataSong(true));
    };
  }
}

function _fetch_data_playlist(state) {
  // If finds song without fetched data
  // returns the song else false
  for (let song of state.playlist) {
    if (!song.fetchedData) {
      return song;
    }
  }
  return false;
}

function shouldFetchDataSong(state) {
  // Background fetching will require a previous fetched playlist
  // or a non data fecthed actualSong
  // If all the playlist is fetched no fecth required
  if (!state.playlist.length) {
    // No playlist to fetch data
    console.log("NO PLAYLIST");
    return false;
  }
  if (state.fetchingData) {
    // Already fetching
    console.log("ALREADY FETCHING");
    return false;
  }
  let _fetch = _fetch_data_playlist(state);
  if (_fetch) {
    // Fetch data for a song
    console.log("_fetch song", _fetch);
    return _fetch;
  }
  // All data fetched
  console.log("ALL FETCHED");
  return false
}


export function fetchDataIfNeeddedSongThunk() {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
  return (dispatch, getState) => {
    let _song = shouldFetchDataSong(getState());
    if (_song) {
      return dispatch(fetchDataSongHelper(_song));
    } else {
      return Promise.resolve(); // Nothing to wait for
    }
  };
}

// Worker communication
// var Worker = require('worker!./song_fetcher_worker.js');
import Worker from "worker!./components/song_fetcher_worker.js";
var worker = new Worker();

worker.postMessage({"cmd": "start"}); //  Start worker
worker._ready = false;

function worker_retrieve_start(song) {
  if (worker._ready) {
    worker.postMessage({"cmd": "start_fetching", "uuid": song.uuid});
    return true;
  } else {
    console.log("NOT READY WORKER");
    return false;
  }
}

export const fetchDataMiddleware = createOneShot((dispatch) => {
  // This function is called exactly once as soon as the first action
  // runs through redux. Perfect moment to glue things together!

  // The worker must be able to dispatch
  // so message event listener should be defined here
  // Handles responses from the worker
  // Register only once
  worker.addEventListener('message', (e) => {
    let cmd = e.data.cmd;
    console.log("worker listener ", cmd);
    if (cmd === "end_fetch") {
      dispatch(receiveDataSong({dataUrl: e.data.dataUrl, uuid: e.data.uuid}))
      dispatch(endFetchDataSong(true));
      return;
    }
    if (cmd === "error_fetch") {
      console.log("worker error_fetch");
      dispatch(errorFetchDataSong(err));
      return;
    }
    if (cmd === "worker_ready") {
      worker._ready = true;
      console.log("worker_READY");
      return;
    }
  }, false);
});
