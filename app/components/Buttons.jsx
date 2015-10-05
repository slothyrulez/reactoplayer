import React, { PropTypes } from 'react';
import { Play, Pause, Stop, Volume, Next, Prev, VolumeMute, VolumeIncrease, VolumeDecrease } from "./SpecializedButtons.jsx";

export default class Buttons extends React.Component {
  static PropTypes = {
    onButtonClick: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
  }
  render() {
    var {...props} = this.props;
    return (
      <div className='Buttons'>
        <Play {...props} />
        <Pause {...props} />
        <Stop {...props} />
        <Prev {...props} />
        <Next {...props} />
        <VolumeMute {...props} />
        <VolumeIncrease {...props} />
        <VolumeDecrease {...props} />
      </div>
    );
  }
}
