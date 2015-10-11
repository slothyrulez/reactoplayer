import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { VOL_DEC, VOL_INC, VOL_MUTE } from "../actions";
import { increaseVolume, decreaseVolume, muteVolume, changeVolume } from "../actions";
import { NEXT_SONG, PREV_SONG, PLAY_SONG, PAUSE_SONG } from "../actions";
import { playSong, pauseSong, nextSong, prevSong } from "../actions";

import { fetchIfNeeddedSongsThunk, fetchDataIfNeeddedSongThunk } from "../actions_network";

import Buttons from "./Buttons.jsx";
import Volume from "./Volume.jsx";
import Visor from "./Visor.jsx";
import Sound from "./Sound.jsx";
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
    //this.playlist =  new PlayList();
    //this.sm2 = soundManager();
    console.log("Player ", this);
    // Load playlist
    this.props.dispatch(fetchIfNeeddedSongsThunk([]));
    // fetchSongs(this.playlist);
    // componentWillMount
    // for (var song of this.props.playlist){
    //   this.queue.addSong(song);
    // }
  }
  componentDidUpdate(prevProps, prevState){
    // Data fetch logic start
    console.log("PLAYER UPDATE");
    this.props.dispatch(fetchDataIfNeeddedSongThunk());
  }
  render() {
    let {...allprops} = this.props;
    return (
      <div className='Player'>
        <Buttons onButtonClick={(eve, action) => this.handleClickButton(eve, action) } />
        <Visor {...allprops} />
        <Volume onVolumeChange={(eve) => this.handleVolumeRange(eve)} volume={this.props.volume} />
        <Sound playlist={this.props.playlist} actualSong={this.props.actualSong} volume={this.props.volume} playing={this.props.playing}/>
      </div>
    );
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


// Single song definition
//   {
//    uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//    author:  "lala",
//    name: "lala,
//    tags: ["alternative", "rock"],
//    date: "25-07-2014"
//    fetchedData: false,
//    dataUrl: "",
//   }

// Global state sxample
// {
//   actualSong: 0,
//   playing: true,,
//   volume: 50,
//   fetching: false,
//   fetchingData: false,
//   playlist: [{
//     uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//     author: 'Consider using Redux',
//     date: "25-07-2014",
//     name: "lalala",
//     tags: ["alternative", "rock"],
//     fetchedData: false,
//     dataUrl: "",
//   }, {
//     uuid: "52635571-3e25-475f-8e79-219af57e41e4",
//     author: 'Keep all state in a single tree',
//     date: "25-07-2014",
//     name: 'troloro',
//     tags: ["alternative", "rock"],
//     fetchedData: false
//     dataUrl: "",
//   }]
// }



// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    volume: state.volume,
    playing: state.playing,
    playlist: state.playlist,
    actualSong: state.actualSong,
    fetching: state.fetching,
    fetchingData: state.fetchingData,
  };
}

export default connect(select)(Player);
