import React from 'react';

import { VOL_DEC, VOL_INC, VOL_MUTE } from "../actions";
import { PLAY_SONG, PAUSE_SONG, NEXT_SONG, PREV_SONG } from "../actions";
import { Button, ToggleButton } from "./Button.jsx";

export class PlayPauseToggle extends ToggleButton {
  constructor(props) {
    super(props);
    this.button_name = "PlayPauseToggle";
    this.button_actions = [PLAY_SONG, PAUSE_SONG];
    this.icon_names = ["p_play", "p_pause"];
  }
}

export class Play extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Play";
    this.icon_name = "p_play";
    this.button_action = PLAY_SONG;
  }
}

export class Pause extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Pause";
    this.icon_name = "p_pause";
    this.button_action = PAUSE_SONG;
  }
}

export class Stop extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Stop";
    this.icon_name = "p_stop";
    this.button_action = "STOP_SONG";
  }
}

export class Prev extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Prev";
    this.icon_name = "p_prev";
    this.button_action = PREV_SONG;
  }
}

export class Next extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Next";
    this.icon_name = "p_next";
    this.button_action = NEXT_SONG;
  }
}

export class VolumeMute extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Volume_mute";
    this.icon_name = "p_vol_mute";
    this.button_action = VOL_MUTE;
  }
}

export class VolumeDecrease extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Volume_decrease";
    this.icon_name = "p_vol_dec";
    this.button_action = VOL_DEC;
  }
}

export class VolumeIncrease extends Button {
  constructor(props) {
    super(props);
    this.button_name = "Volume_increase";
    this.icon_name = "p_vol_inc";
    this.button_action = VOL_INC;
  }
}
