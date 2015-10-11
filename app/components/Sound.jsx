import React from 'react';
import { soundManager } from 'soundmanager2';

export default class Sound extends React.Component {
  constructor(props){
    super(props);
    this.sm2 = soundManager;
    this.sound = undefined;
  }
  _get_actual(){
    return this.props.playlist[this.props.actualSong];
  }
  is_ok() {
    return this.sm2.ok();
  }
  _createSound(props){
    let _actual = this._get_actual();
    let defaultSoundProps = {
      autoPlay: false,
      volume: this.props.volume,
      url: _actual.dataUrl,
      id: "s" + _actual.uuid,
    }
    this.sound = this.sm2.createSound(defaultSoundProps);
    console.log(this.sound);
  }
  _loadSound(){
    this.sm2.load(this.sound.id);
  }
  _hasSongChanged(next, actual){
    return (next!==actual);
  }
  _hasPropChanged(next, actual){
    return (next!==actual);
  }
  _changeSong(){
    this._createSound();
    this._loadSound();
  }
  _changeVolume() {
    this.sm2.setVolume(this.volume);
  }
  _play() {
    this.sm2.play(this.sound.id);
  }
  _pause(){
    this.sm2.pauseAll();
  }
  componentWillUpdate(nextProps, nextState){
    console.log("UPDATE ", nextProps, nextState);

    console.log("SONG CHANGE ???", nextProps.actualSong !== this.props.actualSong);
    console.log("SONG CHANGE PRE ???", this._hasSongChanged(nextProps.actualSong, this.props.actualSong));
  }
  componentDidUpdate(prevProps, prevState){
    if (this._hasPropChanged(this.props.volume, prevProps.volume)) {
      this._changeVolume();
    }
    if (this._hasSongChanged(this.props.actualSong, prevProps.actualSong)) {
      this._changeSong();
    }
    if (this.props.playing) {
      this._play();
    } else {
      this._pause();
    }
  }
  render() {
    return <noscript />;
  }
}
