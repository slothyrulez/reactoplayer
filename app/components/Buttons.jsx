import React, { PropTypes } from 'react';
import { Play, Pause, Stop, Volume, Next, Prev, VolumeMute, VolumeIncrease, VolumeDecrease } from "./SpecializedButtons.jsx";

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
        <Play {...props} />
        <Pause {...props} />
        <Prev {...props} />
        <Next {...props} />
        <VolumeMute {...props} />
        <VolumeIncrease {...props} />
        <VolumeDecrease {...props} />
      </div>
    );
  }
}
