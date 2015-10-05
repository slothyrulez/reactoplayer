import { SERVER_URL, SONGS_API_URL } from "./components/Player"

import fetch from 'isomorphic-fetch';

// ACTION TYPES
export const NEXT_SONG = 'NEXT_SONG';
export const PREV_SONG = 'PREV_SONG';
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const VOL_MUTE = 'VOL_MUTE';
export const VOL_INC = 'VOL_INC';
export const VOL_DEC = 'VOL_DEC';
export const VOL_CHG = 'VOL_CHG';
// NETWORK
export const SONGS_FETCH = 'SONGS_FETCH';
export const SONGS_ENDFETCH = 'SONGS_ENDFETCH';
export const SONGS_RECEIVE = 'SONGS_RECEIVE';
export const SONGS_FETCH_ERR = 'SONGS_FETCH_ERR';

// OTHER CONSTANTS
// export const VisibilityFilters = {
//   SHOW_ALL: 'SHOW_ALL',
//   SHOW_COMPLETED: 'SHOW_COMPLETED',
//   SHOW_ACTIVE: 'SHOW_ACTIVE'
// };

// ACTION CREATORS
export function nextSong(song) {
  return { type: NEXT_SONG, song };
}

export function prevSong(song) {
  return { type: PREV_SONG, song };
}

export function playSong(bool) {
  return { type: PLAY_SONG, bool };
}

export function pauseSong(bool) {
  return { type: PAUSE_SONG, bool };
}

export function muteVolume(num) {
  return { type: VOL_MUTE, num };
}

export function increaseVolume(num) {
  return { type: VOL_INC, num };
}

export function decreaseVolume(num) {
  return { type: VOL_DEC, num };
}

export function changeVolume(num) {
  return { type: VOL_CHG, num };
}

// NETWORK FECTH
export function fetchSongs(bool) {
  return {
    type: SONGS_FETCH,
    bool
  };
}

export function endfetchSongs(bool) {
  return {
    type: SONGS_ENDFETCH,
    bool
  };
}

export function receiveSongs(json) {
  return {
    type: SONGS_RECEIVE,
    json,
    receivedAt: Date.now()
  };
}

export function errorFetchSong(err) {
  return {
    type: SONGS_FETCH_ERR,
    err,
    message: err.message || "SONGS_FETCH_ERR"
  };
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
          console.log(data);
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
