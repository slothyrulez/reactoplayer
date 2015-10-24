import * as actions from './actions';
import * as network from './actions_network';
import { VOLUME_MIN, VOLUME_STEP, VOLUME_MAX } from "./settings";

const initialState = {
  actualSong: undefined,
  playing: false,
  playPosition: 0,
  seekPosition: undefined,
  playlist: [],
  fetching: false,
  fetchingData: false,
  // volume: VOLUME_MIN,
  volume: 15,
  autoPlay: false,
  autoFetch: true,
};

function AutoFetchChangeReducer(state, action) {
  return action.bool;
}

function AutoPlayChangeReducer(state, action) {
  return !state;
}

function PositionChangeReducer(state, action) {
  return action.position;
}

function PositionSeekingReducer(state, action) {
  return action.position;
}

function SongEndReducer(state, action) {
  let actual = state.actualSong;
  let list = state.playlist;
  return get_next(list, actual);
}

function LoadSongReducer(state, action) {
  // state is playlist
  // action.song == actualSong
  let idx = action.song;
  let song = state[idx];
  song.duration = action.sound.duration;
  return state;
}

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
    case actions.SONG_END:
      return Object.assign({}, state, {
        actualSong: SongEndReducer(state, action)
      });
    case actions.PLAY_SONG:
    case actions.PAUSE_SONG:
      return Object.assign({}, state, {
        playing: PlayingReducer(state.playing, action),
      });
    case actions.AUTOPLAY:
      return Object.assign({}, state, {
        autoPlay: AutoPlayChangeReducer(state, action),
      });
    case actions.SONG_LOAD:
      return Object.assign({}, state, {
        playlist: LoadSongReducer(state.playlist, action),
        playPosition: 0,
      });
    case actions.SONG_SEEK:
      return Object.assign({}, state, {
        seekPosition: PositionSeekingReducer(state, action),
        playPosition: PositionSeekingReducer(state, action),
      });
    case actions.SONG_PROGRESS:
      return Object.assign({}, state, {
        playPosition: PositionChangeReducer(state.playPosition, action),
      });
    case network.AUTO_FETCH:
      return Object.assign({}, state, {
        autoPlay: AutoPlayChangeReducer(state.autoPlay, action)
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
  yield Object.assign({}, song, { dataUrl: undefined, fetchedData: false });
}

export default PlayerApp;
