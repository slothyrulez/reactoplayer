import React from 'react';
import { soundManager } from 'soundmanager2';

export default class Sound extends React.Component {
  constructor(props){
    super(props);
    this.sm2 = soundManager;
    this.playing = false;
  }
  is_ok() {
    return this.sm2.ok();
  }
  is_palying() {
    return this.playing;
  }
  render() {
    return <noscript />;
  }
}
