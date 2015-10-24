import React, { PropTypes } from 'react';
import { PlayPauseToggle, Play, Pause, Stop, Volume, Next, Prev, VolumeMute, VolumeIncrease, VolumeDecrease } from "./SpecializedButtons.jsx";

export default class Buttons extends React.Component {
  static PropTypes = {
    onButtonClick: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.className="buttons";
  }
  render() {
    var {...props} = this.props;
    return (
      <div className={this.className}>
        <PlayPauseToggle {...props} />
        <Prev {...props} />
        <Next {...props} />
        <VolumeMute {...props} />
      </div>
    );
  }
}
