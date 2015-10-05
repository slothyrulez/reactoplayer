import React from 'react';

export default class Visor extends  React.Component {
  constructor(props) {
    super(props);
  }
  render_song(){
    if (this.props.fetching) {
      return;
    } else {
      let song = this.props.playlist[this.props.actualsong];
      if (song) {
        return (
          <div>
          <span>SONG AUTHOR {song.author}</span>
          <span>SONG TITLE {song.title}</span>
          <span>SONG DURATION {song.duration}</span>
          </div>
        );
      } else {
         return;
      }
    }
  }
  render() {
    return (
      <div className="Visor">
        {this.render_song()}
        <span>PLAYING {this.props.playing?"TRUE":"FALSE"}</span>
        <span>VOLUME {this.props.volume}</span>
        <span>FETCHING{this.props.fetching?"TRUE":"FALSE"}</span>
      </div>
    );
  }
}
