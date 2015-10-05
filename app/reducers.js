import * as actions from './actions';
import { VOLUME_MIN, VOLUME_STEP, VOLUME_MAX } from "./components/Player";

const initialState = {
  volume: VOLUME_MIN,
  playing: false,
  playlist: [],
  actualsong: 0,
  fetching: false,
};

function VolumeReducer(state, action) {
  console.log(action);
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
  let actual = state.actualsong;
  let list = state.playlist;
  switch (action.type) {
    case actions.NEXT_SONG:
      return get_next(list, actual);
    case actions.PREV_SONG:
      return get_prev(list, actual);
    default:
      return state.actualsong;
  }
}

function PlayingReducer(state, action) {
  return action.bool;
}

function FetchingReducer(state, action) {
  if (action.type === actions.SONGS_ENDFETCH) {
    return false;
  } else if (action.type === actions.SONGS_FETCH) {
    return true;
  }
  return state;
}

function FetchReducer(state, action) {
  switch (action.type) {
    case actions.SONGS_RECEIVE:
      return action.json;
    case actions.SONGS_FETCH_ERR:
      return state;
    default:
      return state;
  }
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
        actualsong: SongMoveReducer(state, action)
      });
    case actions.PLAY_SONG:
    case actions.PAUSE_SONG:
      return Object.assign({}, state, {
        playing: PlayingReducer(state.playing, action)
      });
    case actions.SONGS_FETCH:
    case actions.SONGS_ENDFETCH:
      return Object.assign({}, state, {
        fetching: FetchingReducer(state.fetching, action)
      });
    case actions.SONGS_RECEIVE:
    case actions.SONGS_FETCH_ERR:
      return Object.assign({}, state, {
        playlist: FetchReducer(state.playlist, action)
      });
    default:
      return state;
  }
  return state;
}


export default PlayerApp;
