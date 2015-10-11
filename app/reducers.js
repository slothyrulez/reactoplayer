import * as actions from './actions';
import * as network from './actions_network';
import { VOLUME_MIN, VOLUME_STEP, VOLUME_MAX } from "./settings";

const initialState = {
  volume: VOLUME_MIN,
  playing: false,
  playlist: [],
  actualSong: undefined,
  fetching: false,
  fetchingData: false,
};

function VolumeReducer(state, action) {
  switch (action.type) {
    case actions.VOL_CHG:
      return action.num;
    case actions.VOL_MUTE:
      return VOLUME_MIN;
    case actions.VOL_INC:
      let plus_state = state + VOLUME_STEP;
      return plus_state <= VOLUME_MAX ? plus_state : state;
    case actions.VOL_DEC:
      let less_state = state - VOLUME_STEP;
      return less_state >= VOLUME_MIN ? less_state : state;
    default:
      return state;
  }
}

function get_prev(list, actual) {
  if (actual > 0) {
    return actual - 1;
  }
  return actual;
}

function get_next(list, actual) {
  if (actual < get_size(list) - 1) {
    return actual + 1;
  }
  return actual;
}

function get_size(list) {
  return list.length;
}

function get_song(list, actual){
  return list[actual];
}

function SongMoveReducer(state, action) {
  let actual = state.actualSong;
  let list = state.playlist;
  switch (action.type) {
    case actions.NEXT_SONG:
      return get_next(list, actual);
    case actions.PREV_SONG:
      return get_prev(list, actual);
    default:
      return state.actualSong;
  }
}

function PlayingReducer(state, action) {
  return action.bool;
}

function FetchingReducer(state, action) {
  if (action.type === network.SONGS_ENDFETCH) {
    return false;
  } else if (action.type === network.SONGS_FETCH) {
    return true;
  }
  return state;
}

function FetchReducer(state, action) {
  switch (action.type) {
    case network.SONGS_RECEIVE:
      action.json.forEach((song, idx) => {
        action.json[idx] = Object.assign({}, song, { dataUrl: undefined, fetchedData: false });
      });
      return action.json;
    case network.SONGS_FETCH_ERR:
      return state;
    default:
      return state;
  }
}

function FetchingDataReducer(state, action) {
  if (action.type === network.SONG_DATA_ENDFETCH) {
    return false;
  } else if (action.type === network.SONG_DATA_FETCH) {
    return true;
  }
  return state;
}

function FetchDataReducer(state, action) {
  switch (action.type) {
    case network.SONG_DATA_RECEIVE:
      // Here state is the playlist
      // _song or false
      let _song = _findSongByUuid(state, action.uuid);
      if (_song !== false) {
        _song.fetchedData = action.fetchedData;
        _song.dataUrl = action.dataUrl;
      }
      return state;
    case network.SONG_DATA_FETCH_ERR:
      return state;
    default:
      return state;
  }
}

function FirstSongReducer(state, action) {
  if (state === undefined) {
    return 0;
  }
  return state;
}

function PlayerApp(state = initialState, action) {
  switch (action.type) {
    case actions.VOL_INC:
    case actions.VOL_DEC:
    case actions.VOL_MUTE:
    case actions.VOL_CHG:
      return Object.assign({}, state, {
        volume: VolumeReducer(state.volume, action)
      });
    case actions.NEXT_SONG:
    case actions.PREV_SONG:
      return Object.assign({}, state, {
        actualSong: SongMoveReducer(state, action)
      });
    case actions.PLAY_SONG:
    case actions.PAUSE_SONG:
      return Object.assign({}, state, {
        playing: PlayingReducer(state.playing, action),
      });
    case network.SONGS_FETCH:
    case network.SONGS_ENDFETCH:
      return Object.assign({}, state, {
        fetching: FetchingReducer(state.fetching, action)
      });
    case network.SONGS_RECEIVE:
    case network.SONGS_FETCH_ERR:
      return Object.assign({}, state, {
        playlist: FetchReducer(state.playlist, action)
      });
    case network.SONG_DATA_FETCH:
    case network.SONG_DATA_ENDFETCH:
      return Object.assign({}, state, {
        fetchingData: FetchingDataReducer(state.fetchingData, action)
      });
    case network.SONG_DATA_RECEIVE:
    case network.SONG_DATA_FETCH_ERR:
      return Object.assign({}, state, {
        playlist: FetchDataReducer(state.playlist, action),
        actualSong: FirstSongReducer(state.actualSong, action),
      });
    default:
      return state;
  }
  return state;
}

// UTILS
function _findSongByUuid(playlist, uuid) {
  let result = playlist.find(song => song.uuid === uuid);
  return (result === undefined)?false:result;
}

function* _songPropsExtender(song){
  yield Object.assing({}, song, { dataUrl: undefined, fetchedData: false });
}

export default PlayerApp;
