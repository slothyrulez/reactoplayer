import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { VOL_DEC, VOL_INC, VOL_MUTE } from "../actions";
import { increaseVolume, decreaseVolume, muteVolume, changeVolume } from "../actions";
import { NEXT_SONG, PREV_SONG, PLAY_SONG, PAUSE_SONG } from "../actions";
import { playSong, pauseSong, nextSong, prevSong } from "../actions";
import { fetchIfNeeddedSongsThunk } from "../actions";
import Buttons from "./Buttons.jsx";
import Volume from "./Volume.jsx";
import Visor from "./Visor.jsx";
import Sound from "./Sound.jsx";
import { PlayList } from "./Adts.js";
import Reactosock from "../networking/swamp"

// DEFINITIONS
export const VOLUME_MAX = 100;
export const VOLUME_MIN = 0;
export const VOLUME_STEP = 2;

export const SERVER_URL = "http://localhost:8000";
export const SONGS_API_URL = "/api/songs/?format=json";
export const WS_SERVER_HOST = "localhost:9999";
export const WS_SERVER_ENDPOINT = "/data";

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
  render() {
    let {...allprops} = this.props;
    return (
      <div className='Player'>
        <Buttons onButtonClick={(eve, action) => this.handleClickButton(eve, action) } />
        <Visor {...allprops} />
        <Volume onVolumeChange={(eve) => this.handleVolumeRange(eve)} volume={this.props.volume} />
        <Sound volume={this.props.volume} />
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
        dispatch(playSong(this.playing));
        break;
      case PAUSE_SONG:
        dispatch(pauseSong(this.playing));
        break;
      case "STOP_SONG":
        // talkToWorker();
      default:
        return
    }
    return
  }
}


// var Worker = require('worker!./song_fetcher_worker.js');
// var worker = new Worker();
// worker.addEventListener('message', function(e) {
//   console.log("FROM W ", e.data);
// }, false);
// console.log("talkToWorker", worker);
//
// // talkToWorker
// function talkToWorker(){
//   console.log("talkToWorker", worker);
//   worker.postMessage({'cmd': 'start', 'msg': 'Hi'});
// }
//
import { soundManager } from 'soundmanager2';
var sm2 = soundManager;

var reactosock = new Reactosock(WS_SERVER_HOST, WS_SERVER_ENDPOINT);
// console.log(" -> ", reactosock.connection.socket.readyState);
reactosock.ready(function(){
  // reactosock.getList("song-router", (...args)=>{console.log("SUCCCES", args)}, (...args)=>{console.log("ERROR ", args)});
  reactosock.getSingle("song-router", {"id": 12}, fileHandler, ()=>{console.log("ERROR")});
});

function fileHandler(eve, data){
  let parsed_data = data.song_file;
  let cosa = new Uint8Array(parsed_data);
  console.log("PARSED ", parsed_data, parsed_data.length);
  console.log("UINT ", cosa, cosa.length);
  console.log("UINT ", cosa == parsed_data);
  // let cosa = new Uint8Array(data.song_file);
  let mime = data.mime_type;
  let _ab = new ArrayBuffer([cosa.buffer]);
  let file = new Blob([cosa.buffer], {type : mime });
  console.log("FILE HANDLER", eve, typeof(data.song_file), cosa, _ab, file);
  var url = URL.createObjectURL(file);
  console.log(url);
  var foo = new Audio(url);
  console.log(foo);

  console.log(sm2);
  foo.play();
  var mysong = sm2.createSound(foo);
  // mysong.type=mime;
  // mysong.url = url;
  mysong.play({volume:10});
}
// reactosock.send("foooooo");
//
// function fetchSongs(plist) {
//   fetch(SERVER_URL + SONGS_API_URL, {mode: 'cors'}).then(function(response) {
//     if (response.status !== 200) {
//         console.log("ERROR response code: " + response.status);
//         return;
//     }
//     response.json().then(function(data){
//       console.log(data);
//       plist.addSongs(data);
//       console.log(plist.dataStore);
//     });
//   }).catch(function(err){
//     console.log("FETCH ERROR : ", err);
//   })
// }

// {
//   actualsong: {
//    author:  "lala",
//    name: "lala,
//    tags: ["alternative", "rock"],
//    date: "25-07-2014"
//   }
//   playing: true,,
//   volume: 50,
//   fetching: false,
//   playlist: [{
//     author: 'Consider using Redux',
//     date: "25-07-2014",
//     name: "lalala",
//     tags: ["alternative", "rock"],
//   }, {
//     author: 'Keep all state in a single tree',
//     date: "25-07-2014",
//     name: 'troloro',
//     tags: ["alternative", "rock"],
//   }]
// }


// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  console.log("ARG", state);
  return {
    volume: state.volume,
    playing: state.playing,
    playlist: state.playlist,
    actualsong: state.actualsong,
    fetching: state.fetching,
  };
}

export default connect(select)(Player);
