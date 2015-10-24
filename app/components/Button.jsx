import React, { PropTypes } from 'react';

export class Button extends  React.Component {
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
    this.className = "button";
  }
  render() {
    return (
      <div className={this.className + "-wrapper"}>
        <button className={this.className + " icon icon-" + this.icon_name + " " + this.button_name} onClick={e => this.handleClick(e)}></button>
      </div>
    )
  }
  handleClick(e) {
    this.props.onButtonClick(e, this.button_action);
  }
}

export class ToggleButton extends  React.Component {
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
    this._toggle = 0;
    this.button_name = "";
    this.icon_names = [];
    this.button_actions = [];
    this.className = "button";
    this._toggle_state = this._toggle_state.bind(this);
    this.button_action = this.button_action.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.icon_name = this.icon_name.bind(this);
  }
  _toggle_state() {
    if (this._toggle) {
      this._toggle = 0;
    } else {
      this._toggle = 1;
    }
  }
  icon_name() {
    return this.icon_names[this._toggle];
  }
  button_action() {
    return this.button_actions[this._toggle];
  }
  componentWillMount() {
    // Internal status _toggle is related to external state playing
    if (this.props.playing) {
      this._toggle = 1;
    } else {
      this._toggle = 0;
    }
  }
  render() {
    return (
      <div className={this.className + "-wrapper"}>
        <button className={this.className + " icon icon-" + this.icon_name() + " " + this.button_name} onClick={e => this.handleClick(e)}></button>
      </div>
    )
  }
  handleClick(e) {
    // Toggle internal status 
    this._toggle_state();
    this.props.onButtonClick(e, this.button_action());
  }
}
