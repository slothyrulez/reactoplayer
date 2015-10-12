// ACTION TYPES
export const NEXT_SONG = 'NEXT_SONG';
export const PREV_SONG = 'PREV_SONG';
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const AUTOPLAY = 'AUTOPLAY';
export const SONG_LOAD = 'SONG_LOAD';
export const SONG_PROGRESS = 'SONG_PROGRESS';
export const SONG_SEEK = 'SONG_SEEK';
export const SONG_END = 'SONG_END';
export const VOL_MUTE = 'VOL_MUTE';
export const VOL_INC = 'VOL_INC';
export const VOL_DEC = 'VOL_DEC';
export const VOL_CHG = 'VOL_CHG';

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

export function autoPlayChange() {
  return { type: AUTOPLAY };
}

export function songLoad(sound, song){
  return { type: SONG_LOAD, sound:sound, song:song};
}

export function songProgress(position){
  return { type: SONG_PROGRESS, position };
}

export function songSeek(position){
  return { type: SONG_SEEK, position: position };
}

export function songEnd(song) {
  return { type: SONG_END, song };
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
