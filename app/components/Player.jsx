import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { VOL_DEC, VOL_INC, VOL_MUTE } from "../actions";
import { increaseVolume, decreaseVolume, muteVolume, changeVolume } from "../actions";
import { NEXT_SONG, PREV_SONG, PLAY_SONG, PAUSE_SONG } from "../actions";
import { playSong, pauseSong, nextSong, prevSong } from "../actions";
import { SONG_SEEK, SONG_LOAD, SONG_END, SONG_PROGRESS} from "../actions";
import { songSeek, songLoad, songEnd, songProgress} from "../actions";

import { fetchIfNeeddedSongsThunk, fetchDataIfNeeddedSongThunk } from "../actions_network";

import Buttons from "./Buttons.jsx";
import Volume from "./Volume.jsx";
import Visor from "./Visor.jsx";
import Sound from "./Sound.jsx";
import Progress from "./Progress.jsx";
import { PlayList } from "./Adts.js";

export default class Player extends React.Component {
  // static propTypes = {
  //   volume: PropTypes.number.isRequired,

  //   autoPlay: React.PropTypes.bool.isRequired,
  //   maxLoops: React.PropTypes.number.isRequired,
  //   posterFrameSrc: React.PropTypes.string.isRequired,
  //   videoSrc: React.PropTypes.string.isRequired,
//  }
  constructor(props){
    super(props);
    this.className = "player";
    // Load playlist
    this.props.dispatch(fetchIfNeeddedSongsThunk([]));
  }
  componentDidUpdate(prevProps, prevState){
    // Data fetch logic start
    this.props.dispatch(fetchDataIfNeeddedSongThunk());
  }
  render() {
    let {...allprops} = this.props;
    return (
      <div className={this.className}>
        <Buttons onButtonClick={(eve, action) => this.handleClickButton(eve, action) } />
        <Volume
          onVolumeChange={(eve) => this.handleVolumeRange(eve)}
          volume={this.props.volume} />
        <Progress
          onSongSeekChange={(eve) => this.handleProgressSeek(eve)}
          playPosition={this.props.playPosition}
          playlist={this.props.playlist}
          actualSong={this.props.actualSong} />
        <Visor {...allprops} />
        <Sound
          onSongLoad={(data) => this.handleSongLoad(data)}
          onSongProgress={(data) => this.handleSongProgress(data)}
          onSongEnd={(data) => this.handleSongEnd(data)}
          autoPlay={this.props.autoPlay}
          playPosition={this.props.playPosition}
          seekPosition={this.props.seekPosition}
          playlist={this.props.playlist}
          actualSong={this.props.actualSong}
          volume={this.props.volume}
          playing={this.props.playing} />
      </div>
    );
  }
  handleSongLoad(data) {
    this.props.dispatch(songLoad(data.sound, data.song));
  }
  handleSongEnd(song) {
    this.props.dispatch(songEnd(song));
  }
  handleSongProgress(data) {
    this.props.dispatch(songProgress(data.position));
  }
  handleProgressSeek(eve) {
    this.props.dispatch(songSeek(Number(eve.target.value)));
  }
  handleVolumeRange(eve) {
    this.props.dispatch(changeVolume(Number(eve.target.value)));
  }
  handleClickButton(eve, button_action) {
    let { dispatch } = this.props;
    switch (button_action) {
      case VOL_MUTE:
        dispatch(muteVolume(this.props.volume));
        break;
      case VOL_DEC:
        dispatch(decreaseVolume(this.props.volume));
        break;
      case VOL_INC:
        dispatch(increaseVolume(this.props.volume));
        break;
      case NEXT_SONG:
        dispatch(nextSong(this.props.actualsong));
        break;
      case PREV_SONG:
        dispatch(prevSong(this.props.actualsong));
        break;
      case PLAY_SONG:
        dispatch(playSong(true));
        break;
      case PAUSE_SONG:
        dispatch(pauseSong(false));
        break;
      case "STOP_SONG":
        // talkToWorker();
      default:
        return
    }
    return
  }
}





// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    volume: state.volume,
    autoPlay: state.autoPlay,
    playing: state.playing,
    playlist: state.playlist,
    playPosition: state.playPosition,
    seekPosition: state.seekPosition,
    actualSong: state.actualSong,
    fetching: state.fetching,
    fetchingData: state.fetchingData,
  };
}

export default connect(select)(Player);

// DOC
// Single song definition
//   {
//    uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//    author:  "lala",
//    name: "lala,
//    tags: ["alternative", "rock"],
//    duration:  30.233,
//    date: "25-07-2014"
//    fetchedData: false,
//    dataUrl: "",
//   }

// Global state sxample
// {
//   actualSong: 0,
//   playing: true,
//   playPosition: 0,
//   seekPosition: undefined,
//   autoPlay: false,
//   volume: 50,
//   fetching: false,
//   fetchingData: false,
//   playlist: [{
//     uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//     author: 'Consider using Redux',
//     date: "25-07-2014",
//     name: "lalala",
//     duration:  30.233,
//     tags: ["alternative", "rock"],
//     fetchedData: false,
//     dataUrl: "",
//   }, {
//     uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//     author: 'Keep all state in a single tree',
//     date: "25-07-2014",
//     name: 'troloro',
//     duration:  30.233,
//     tags: ["alternative", "rock"],
//     fetchedData: false
//     dataUrl: "",
//   }]
// }
