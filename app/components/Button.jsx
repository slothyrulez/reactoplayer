import React, { PropTypes } from 'react';

export default class Button extends  React.Component {
  static propTypes = {
    onButtonClick: PropTypes.func.isRequired
  }
  //   onAddClick: PropTypes.func.isRequired
  //   autoPlay: React.PropTypes.bool.isRequired,
  //   maxLoops: React.PropTypes.number.isRequired,
  //   posterFrameSrc: React.PropTypes.string.isRequired,
  //   videoSrc: React.PropTypes.string.isRequired,
  // }
  constructor(props) {
    super(props);
    this.button_name = "";
    this.icon_name = "";
    this.button_action = "";
    this.handleClick = this.handleClick.bind(this);
  }
  render() {
    return (
      <div className="player-button-wrapper">
        <button className={"player-button icon icon-" + this.icon_name + " " + this.button_name} onClick={e => this.handleClick(e)}></button>
      </div>
    )
  }
  handleClick(e) {
    this.props.onButtonClick(e, this.button_action);
    //console.log(e, this.button_name, this.button_action);
  }
}
