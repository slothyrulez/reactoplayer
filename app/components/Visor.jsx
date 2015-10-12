import React from 'react';

export default class Visor extends  React.Component {
  constructor(props) {
    super(props);
    this.className = "Visor";
  }
  _get_song() {
    return this.props.playlist[this.props.actualSong];
  }
  render_autoplay(){
    return (
      <div>AUTO-PLAY: { `${this.props.autoPlay}` }</div>
    )
  }
  render_fetching(){
    let _fetching = (this.props.fetching || this.props.fetchingData);
    return (
      <div>FETCHING: { `${_fetching}` }</div>
    )
  }
  render_song(){
    let song = {title: "", author: "", duration: 0 };
    if (!this.props.fetching) {
      let _song = this._get_song();
      if (_song) {
        song = {title: _song.title, author: _song.author, duration: _song.duration };
      }
    }
    return (<div>
      <div>TITLE - {`${song.title}`}</div>
      <div>AUTHOR - {`${song.author}`}</div>
      <div>DURATION - {`${song.duration}`}</div>
      </div>
    )
  }
  render() {
    return (
      <div className={this.className}>
        {this.render_song()}
        {this.render_fetching()}
        {this.render_autoplay()}
        <span>PLAYING {this.props.playing?"TRUE":"FALSE"}</span>
      </div>
    );
  }
}
//
// function html(literals, ...args){
//   return
// }
// function song_template(song) { return (
//     <div>TITLE - `${song.title}`</div>
//     <div>AUTHOR - `${song.author}`</div>
//     <div>DURATION - `${song.duration}`</div>
//   )
// }
