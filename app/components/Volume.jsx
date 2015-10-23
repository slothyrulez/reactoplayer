import React from 'react';
import { VOLUME_MIN, VOLUME_STEP, VOLUME_MAX } from "./Player";

export default class Volume extends  React.Component {
  constructor(props) {
    super(props);
    this.class_name = "volume";
  }
  render() {
    return (
      <div className={this.class_name + "-wrapper"}>
        <input className={this.class_name}
          type="range"
          min={VOLUME_MIN}
          max={VOLUME_MAX}
          step={VOLUME_STEP}
          value={this.props.volume}
          onChange={(eve) => {this.props.onVolumeChange(eve)}} />
      </div>
    );
  }
}
