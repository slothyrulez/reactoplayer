import React from 'react';

export default class Volume extends  React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <input className="volume" type="range" />
      </div>
    );
  }
}
