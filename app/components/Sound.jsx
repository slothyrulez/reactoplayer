import React, { PropTypes } from 'react';
import { soundManager } from 'soundmanager2';

export default class Sound extends React.Component {
  static PropTypes = {
    onSongLoad: PropTypes.func.isRequired,
    onSongProgress: PropTypes.func.isRequired,
    onSongEnd: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.sm2 = soundManager;
    // this.handleSm2Ready = this.sm2.onready.bind(this);
    this.sm2.onready(() => {this.handleSm2Ready()});
    this.sound = undefined;
  }
  handleSm2Ready(){
    // this.handleSongEnd = this.sm2.onstop.bind(this);
  }
  handleOnLoadSong(args) {
    this.props.onSongLoad({
      sound: this.sound,
      song: this.props.actualSong,
    });
    if (this.props.playing && this.props.autoPlay){
      this._play();
    }
  }
  handleOnFinishSong(args) {
    this.props.onSongEnd(this.props.actualSong);
  }
  handleWhilePlayingSong(args) {
    let _percent = Math.floor(this.sound.position * 100 /  this.sound.duration);
    this.props.onSongProgress({
      position: this.sound.position,
      duration: this.sound.duration,
      percent:_percent
    });
  }
  _get_actual() {
    return this.props.playlist[this.props.actualSong];
  }
  is_ok() {
    return this.sm2.ok();
  }
  _createSound(props) {
    let _actual = this._get_actual();
    let defaultSoundProps = {
      autoPlay: this.props.autoPlay,
      multiShot: false,
      volume: this.props.volume,
      url: _actual.dataUrl,
      id: "s" + _actual.uuid,
      onload: (...args) => { this.handleOnLoadSong(args);},
      whileplaying: (...args) => { this.handleWhilePlayingSong(args);},
      onfinish: (...args) => { this.handleOnFinishSong(args);},
    };
    this.sound = this.sm2.createSound(defaultSoundProps);
  }
  _loadSound() {
    this.sm2.load(this.sound.id);
  }
  _hasSongChanged(next, actual) {
    return (next!==actual);
  }
  _hasPropChanged(next, actual) {
    return (next!==actual);
  }
  _changeSong() {
    this._createSound();
    this._loadSound();
  }
  _changeVolume() {
    this.sm2.setVolume(this.props.volume);
  }
  _changePosition(){
    this.sm2.setPosition(this.sound.id, this.props.seekPosition);
  }
  _changeAutoPlay() {
    this.sm2.setVolume(this.volume);
  }
  _play() {
    this.sm2.play(this.sound.id);
  }
  _pause() {
    this.sm2.pauseAll();
  }
  // componentWillUpdate(nextProps, nextState){
  // }
  componentDidUpdate(prevProps, prevState){
    if (this._hasPropChanged(this.props.volume, prevProps.volume)) {
      this._changeVolume();
    }
    if (this._hasPropChanged(this.props.seekPosition, prevProps.seekPosition)) {
      this._changePosition();
    }
    if (this._hasPropChanged(this.props.autoPlay, prevProps.autoPlay)) {
      this._changeAutoPlay();
    }
    if (this._hasSongChanged(this.props.actualSong, prevProps.actualSong)) {
      this._changeSong();
    }
    if (this._hasPropChanged(this.props.playing, prevProps.playing)) {
      if (this.props.playing) {
        this._play();
      } else {
        this._pause();
      }
    }
  }
  render() {
    return <noscript />;
  }
}
