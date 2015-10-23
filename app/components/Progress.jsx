import React from 'react';

export default class Progress extends  React.Component {
  constructor(props) {
    super(props);
    this.class_name = "progress";
  }
  _get_actual(){
    return this.props.playlist[this.props.actualSong];
  }
  render() {
    let _song = this._get_actual();
    let duration = (_song)?_song.duration:100;
    return (
      <div className={this.class_name + "-wrapper"}>
        <input className={this.class_name}
          type="range"
          min={0}
          max={duration}
          step={1}
          value={this.props.playPosition}
          onChange={(eve) => { this.handleSeekPosition(eve) }} />
      </div>
    );
  }
  handleSeekPosition(eve){
    // Fire only if there is a song loaded
    if (this.props.actualSong !== undefined) {
      this.props.onSongSeekChange(eve);
    }
  }
}
