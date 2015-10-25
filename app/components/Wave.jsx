import React, { PropTypes } from 'react';
// import { WaveSurfer } from 'wavesurfer';

export default class Wave extends React.Component {
  // static PropTypes = {
  //   onSongLoad: PropTypes.func.isRequired,
  //   onSongProgress: PropTypes.func.isRequired,
  //   onSongEnd: PropTypes.func.isRequired,
  // }
  constructor(props) {
    super(props);
    this.className = "Wave";
    this.height = 128;
    this.waveColor = '#999';
    this.progressColor = '#555';
    this.cursorColor = '#333';
    // cursorWidth   : 1,
    // skipLength    : 2,
    // minPxPerSec   : 20,
    this.pixelRatio = window.devicePixelRatio;
    this.fillParent = true;
    // hideScrollbar : false,
    this.normalize = false;
    // audioContext  : null,
    this.container = undefined;
    // dragSelection : true,
    // loopSelection : true,
    // audioRate     : 1,
    this.interact = true;
    this.splitChannels = false;
    // mediaContainer: null,
    // mediaControls : false,
    // renderer      : 'Canvas',
    // backend       : 'WebAudio',
    // mediaType     : 'audio'
    // this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]);
    // this.drawer.init(this.container, this.params);
    // this.drawer = new CanvasDrawer(
    //   this,
    //   this.height,
    //   this.waveColor,
    //   this.progressColor,
    // );
  }
  render() {
    return (
      <div
        ref={(ref) => {
            this._container = ref
          }
        }
        className={this.className} />
    )
  }
  componentDidMount() {
    this.container = this._container.getDOMNode();
    if (!this.container) {
      throw new Error('Container element not found');
    }
    this.mediaContainer = this.container;

    if (!this.mediaContainer) {
      throw new Error('Media Container element not found');
    }

    // Will hold a list of event descriptors that need to be
    // cancelled on subsequent loads of audio
    this.tmpEvents = [];

    this.createDrawer();
    this.createBackend();
  }
  createDrawer() {
    // this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]);
    // this.drawer.init(this.container, this.params);

    // this.drawer.on('redraw', function () {
    //   this.drawBuffer();
    //   // this.drawer.progress(my.backend.getPlayedPercents());
    // });

    // Click-to-seek
    // this.drawer.on('click', function (e, progress) {
    //   setTimeout(function () {
    //     this.seekTo(progress);
    //   }, 0);
    // });

    // Relay the scroll event from the drawer
    // this.drawer.on('scroll', function (e) {
    //   this.fireEvent('scroll', e);
    // });
  }
  createBackend() {}
  getDuration() {
    return this.backend.getDuration();
  }
  toggleInteraction() {
    this.interact = !this.interact;
  }
  drawBuffer() {
    let nominalWidth = Math.round(
      this.getDuration() * this.minPxPerSec * this.pixelRatio
    );
    // let parentWidth = this.drawer.getWidth();
    let width = nominalWidth;

    // Fill container
    if (this.fillParent && (nominalWidth < parentWidth)) {
      width = parentWidth;
    }

    let peaks = this.backend.getPeaks(width);
    // this.drawer.drawPeaks(peaks, width);
    this.fireEvent('redraw', peaks, width);
  }
  stop() {
    // this.pause();
    // this.seekTo(0);
    this.drawer.progress(0);
  }
  exportPCM(length, accuracy, noWindow) {
    /**
     * Exports PCM data into a JSON array and opens in a new window.
     */
    length = length || 1024;
    accuracy = accuracy || 10000;
    noWindow = noWindow || false;
    var peaks = this.backend.getPeaks(length, accuracy);
    var arr = [].map.call(peaks, function (val) {
      return Math.round(val * accuracy) / accuracy;
    });
    var json = JSON.stringify(arr);
    if (!noWindow) {
      window.open('data:application/json;charset=utf-8,' + encodeURIComponent(json));
    }
    return json;
  }
  empty() {
    /**
    * Display empty waveform.
    */
    if (!this.backend.isPaused()) {
      this.stop();
      this.backend.disconnectSource();
    }
    this.clearTmpEvents();
    this.drawer.progress(0);
    this.drawer.setWidth(0);
    this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
  }
}

class CanvasDrawer {
  constructor(container, height, waveColor, progressColor){
    this.container = container;
    this.pixelRatio = window.devicePixelRatio;
    this.width = 0;
    this.height = height * this.pixelRatio;
    this.lastPos = 0;
    this.barWidth = false;
    this.wrapper = undefined;
    this.fillParent = true;
    this.hideScrollbar = true;
    this.canvas = undefined;
    this.waveCc = undefined;
    this.waveColor = waveColor;
    this.progressColor = progressColor;
    this.progressCc = undefined;
  }
  style(el, styles) {
    Object.keys(styles).forEach(function (prop) {
      if (el.style[prop] !== styles[prop]) {
        el.style[prop] = styles[prop];
      }
    });
  }
  handleEvent(e) {
    e.preventDefault();
    let bbox = this.wrapper.getBoundingClientRect();
    return ((e.clientX - bbox.left + this.wrapper.scrollLeft) / this.wrapper.scrollWidth) || 0;
  }
  setupWrapperEvents() {
    this.wrapper.addEventListener('click', function (e) {
      let scrollbarHeight = this.wrapper.offsetHeight - this.wrapper.clientHeight;
      if (scrollbarHeight != 0) {
        // scrollbar is visible.  Check if click was on it
        let bbox = this.wrapper.getBoundingClientRect();
        if (e.clientY >= bbox.bottom - scrollbarHeight) {
          // ignore mousedown as it was on the scrollbar
          return;
        }
      }

      if (this.interact) {
        this.fireEvent('click', e, this.handleEvent(e));
      }
    });

    this.wrapper.addEventListener('scroll', function (e) {
        this.fireEvent('scroll', e);
    });
  }
  createWrapper() {
    this.wrapper = this.container.appendChild(document.createElement('wave'));
    this.style(this.wrapper, {
      display: 'block',
      position: 'relative',
      userSelect: 'none',
      webkitUserSelect: 'none',
      height: this.height + 'px'
    });

    if (this.fillParent) {
      this.style(this.wrapper, {
          width: '100%',
          overflowX: this.hideScrollbar ? 'hidden' : 'auto',
          overflowY: 'hidden'
      });
    }

    // this.setupWrapperEvents();
  }
  createElements() {
    let canvas = this.wrapper.appendChild(
      this.style(document.createElement('canvas'), {
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: 0,
        bottom: 0
      })
    );
    this.waveCc = this.canvas.getContext('2d');

    this.progressWave = this.wrapper.appendChild(
      this.style(document.createElement('wave'), {
        position: 'absolute',
        zIndex: 2,
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden',
        width: '0',
        display: 'none',
        boxSizing: 'border-box',
        borderRightStyle: 'solid',
        borderRightWidth: this.params.cursorWidth + 'px',
        borderRightColor: this.params.cursorColor
      })
    );

    if (this.waveColor != this.progressColor) {
      let progressCanvas = this.progressWave.appendChild(
        document.createElement('canvas')
      );
      this.progressCc = progressCanvas.getContext('2d');
    }
  }
  updateSize() {
      var width = Math.round(this.width / this.pixelRatio);

      this.waveCc.canvas.width = this.width;
      this.waveCc.canvas.height = this.height;
      this.style(this.waveCc.canvas, { width: width + 'px'});
      this.style(this.progressWave, { display: 'block'});

      if (this.progressCc) {
          this.progressCc.canvas.width = this.width;
          this.progressCc.canvas.height = this.height;
          this.style(this.progressCc.canvas, { width: width + 'px'});
      }
      this.clearWave();
  }
  clearWave() {
    this.waveCc.clearRect(0, 0, this.width, this.height);
    if (this.progressCc) {
      this.progressCc.clearRect(0, 0, this.width, this.height);
    }
  }
  resetScroll() {
    if (this.wrapper !== null) {
      this.wrapper.scrollLeft = 0;
    }
  }
  recenter(percent) {
    let position = this.wrapper.scrollWidth * percent;
    this.recenterOnPosition(position, true);
  }
  recenterOnPosition(position, immediate) {
    let scrollLeft = this.wrapper.scrollLeft;
    let half = ~~(this.wrapper.clientWidth / 2);
    let target = position - half;
    let offset = target - scrollLeft;
    let maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;

    if (maxScroll == 0) {
        // no need to continue if scrollbar is not there
        return;
    }

    // if the cursor is currently visible...
    if (!immediate && -half <= offset && offset < half) {
      // we'll limit the "re-center" rate.
      let rate = 5;
      offset = Math.max(-rate, Math.min(rate, offset));
      target = scrollLeft + offset;
    }

    // limit target to valid range (0 to maxScroll)
    target = Math.max(0, Math.min(maxScroll, target));
    // no use attempting to scroll if we're not moving
    if (target != scrollLeft) {
        this.wrapper.scrollLeft = target;
    }
  }
  getWidth() {
    return Math.round(this.container.clientWidth * this.pixelRatio);
  }
  setWidth(width) {
    if (width == this.width) { return; }
    this.width = width;

    if (this.fillParent) {
      this.style(this.wrapper, {
        width: ''
      });
    } else {
      this.style(this.wrapper, {
        width: ~~(this.width / this.pixelRatio) + 'px'
      });
    }
    this.updateSize();
  }
  setHeight(height) {
    if (height == this.height) { return; }
    this.height = height;
    this.style(this.wrapper, {
        height: ~~(this.height / this.pixelRatio) + 'px'
    });
    this.updateSize();
  }
  progress(progress) {
    let minPxDelta = 1 / this.pixelRatio;
    let pos = Math.round(progress * this.width) * minPxDelta;

    if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
      this.lastPos = pos;
      this.updateProgress(progress);
    }
  }
  drawPeaks(peaks, length) {
    this.resetScroll();
    this.setWidth(length);
    this.barWidth ? this.drawBars(peaks) : this.drawWave(peaks);
  }
  destroy() {
    // this.unAll();
    if (this.wrapper) {
      this.container.removeChild(this.wrapper);
      this.wrapper = null;
    }
  }
  updateProgress(progress) {
    let pos = Math.round(this.width * progress) / this.pixelRatio;
    this.style(this.progressWave, { width: pos + 'px' });
  }
  drawWave(peaks, channelIndex) {
    // Split channels
    if (peaks[0] instanceof Array) {
      let channels = peaks;
      if (this.splitChannels) {
        this.setHeight(channels.length * this.height * this.pixelRatio);
        channels.forEach(this.drawWave, this);
        return;
      } else {
        peaks = channels[0];
      }
    }

    // A half-pixel offset makes lines crisp
    let $ = 0.5 / this.pixelRatio;
    let height = this.height * this.pixelRatio;
    let offsetY = height * channelIndex || 0;
    let halfH = height / 2;
    let length = ~~(peaks.length / 2);

    let scale = 1;
    if (this.fillParent && this.width != length) {
      scale = this.width / length;
    }
    var absmax = 1;
    if (this.normalize) {
      let min, max;
      max = Math.max.apply(Math, peaks);
      min = Math.min.apply(Math, peaks);
      absmax = max;
      if (-min > absmax) {
        absmax = -min;
      }
    }

    this.waveCc.fillStyle = this.waveColor;
    if (this.progressCc) {
      this.progressCc.fillStyle = this.progressColor;
    }

    [ this.waveCc, this.progressCc ].forEach(function (cc) {
      if (!cc) { return; }
      cc.beginPath();
      cc.moveTo($, halfH + offsetY);

      for (let i = 0; i < length; i++) {
        let h = Math.round(peaks[2 * i] / absmax * halfH);
        cc.lineTo(i * scale + $, halfH - h + offsetY);
      }

      // Draw the bottom edge going backwards, to make a single closed hull to fill.
      for (let i = length - 1; i >= 0; i--) {
        let h = Math.round(peaks[2 * i + 1] / absmax * halfH);
        cc.lineTo(i * scale + $, halfH - h + offsetY);
      }

      cc.closePath();
      cc.fill();

      // Always draw a median line
      cc.fillRect(0, halfH + offsetY - $, this.width, $);
    }, this);
  }
  drawBars(peaks, channelIndex) {
    // Split channels
    if (peaks[0] instanceof Array) {
      let channels = peaks;
      if (this.params.splitChannels) {
        this.setHeight(channels.length * this.height * this.pixelRatio);
        channels.forEach(this.drawBars, this);
        return;
      } else {
        peaks = channels[0];
      }
    }

    // A half-pixel offset makes lines crisp
    let $ = 0.5 / this.pixelRatio;
    let width = this.width;
    let height = this.height * this.pixelRatio;
    let offsetY = height * channelIndex || 0;
    let halfH = height / 2;
    let length = ~~(peaks.length / 2);
    let bar = this.barWidth * this.pixelRatio;
    let gap = Math.max(this.pixelRatio, ~~(bar / 2));
    let step = bar + gap;

    var absmax = 1;
    if (this.normalize) {
      let min, max;
      max = Math.max.apply(Math, peaks);
      min = Math.min.apply(Math, peaks);
      absmax = max;
      if (-min > absmax) {
        absmax = -min;
      }
    }

    let scale = length / width;

    this.waveCc.fillStyle = this.params.waveColor;
    if (this.progressCc) {
      this.progressCc.fillStyle = this.progressColor;
    }

    [ this.waveCc, this.progressCc ].forEach(function (cc) {
      if (!cc) { return; }
      if (this.reflection) {
        for (let i = 0; i < width; i += step) {
          let h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
          cc.fillRect(i + $, halfH - h + offsetY, bar + $, h * 2);
        }
      } else {
        for (let i = 0; i < width; i += step) {
          let h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
          cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
        }
        for (let i = 0; i < width; i += step) {
          let h = Math.round(peaks[2 * i * scale + 1] / absmax * halfH);
          cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
        }
      }
    }, this);
  }
}

// WaveSurfer.Drawer = {
    // init: function (container, params) {
    //     this.container = container;
    //     this.params = params;
    //
    //     this.width = 0;
    //     this.height = params.height * this.params.pixelRatio;
    //
    //     this.lastPos = 0;
    //
    //     this.createWrapper();
    //     this.createElements();
    // },

    // createWrapper: function () {
    //     this.wrapper = this.container.appendChild(
    //         document.createElement('wave')
    //     );
    //
    //     this.style(this.wrapper, {
    //         display: 'block',
    //         position: 'relative',
    //         userSelect: 'none',
    //         webkitUserSelect: 'none',
    //         height: this.params.height + 'px'
    //     });
    //
    //     if (this.params.fillParent || this.params.scrollParent) {
    //         this.style(this.wrapper, {
    //             width: '100%',
    //             overflowX: this.params.hideScrollbar ? 'hidden' : 'auto',
    //             overflowY: 'hidden'
    //         });
    //     }
    //
    //     this.setupWrapperEvents();
    // },

    // handleEvent: function (e) {
    //     e.preventDefault();
    //     var bbox = this.wrapper.getBoundingClientRect();
    //     return ((e.clientX - bbox.left + this.wrapper.scrollLeft) / this.wrapper.scrollWidth) || 0;
    // },

    // setupWrapperEvents: function () {
    //     var my = this;
    //
    //     this.wrapper.addEventListener('click', function (e) {
    //         var scrollbarHeight = my.wrapper.offsetHeight - my.wrapper.clientHeight;
    //         if (scrollbarHeight != 0) {
    //             // scrollbar is visible.  Check if click was on it
    //             var bbox = my.wrapper.getBoundingClientRect();
    //             if (e.clientY >= bbox.bottom - scrollbarHeight) {
    //                 // ignore mousedown as it was on the scrollbar
    //                 return;
    //             }
    //         }
    //
    //         if (my.params.interact) {
    //             my.fireEvent('click', e, my.handleEvent(e));
    //         }
    //     });
    //
    //     this.wrapper.addEventListener('scroll', function (e) {
    //         my.fireEvent('scroll', e);
    //     });
    // },

    // drawPeaks: function (peaks, length) {
    //     this.resetScroll();
    //     this.setWidth(length);
    //
    //     this.params.barWidth ?
    //         this.drawBars(peaks) :
    //         this.drawWave(peaks);
    // },

    // style: function (el, styles) {
    //     Object.keys(styles).forEach(function (prop) {
    //         if (el.style[prop] !== styles[prop]) {
    //             el.style[prop] = styles[prop];
    //         }
    //     });
    //     return el;
    // },

    // resetScroll: function () {
    //     if (this.wrapper !== null) {
    //         this.wrapper.scrollLeft = 0;
    //     }
    // },

    // recenter: function (percent) {
    //     var position = this.wrapper.scrollWidth * percent;
    //     this.recenterOnPosition(position, true);
    // },

    // recenterOnPosition: function (position, immediate) {
    //     var scrollLeft = this.wrapper.scrollLeft;
    //     var half = ~~(this.wrapper.clientWidth / 2);
    //     var target = position - half;
    //     var offset = target - scrollLeft;
    //     var maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
    //
    //     if (maxScroll == 0) {
    //         // no need to continue if scrollbar is not there
    //         return;
    //     }
    //
    //     // if the cursor is currently visible...
    //     if (!immediate && -half <= offset && offset < half) {
    //         // we'll limit the "re-center" rate.
    //         var rate = 5;
    //         offset = Math.max(-rate, Math.min(rate, offset));
    //         target = scrollLeft + offset;
    //     }
    //
    //     // limit target to valid range (0 to maxScroll)
    //     target = Math.max(0, Math.min(maxScroll, target));
    //     // no use attempting to scroll if we're not moving
    //     if (target != scrollLeft) {
    //         this.wrapper.scrollLeft = target;
    //     }
    //
    // },

    // getWidth: function () {
    //     return Math.round(this.container.clientWidth * this.params.pixelRatio);
    // },
    //
    // setWidth: function (width) {
    //     if (width == this.width) { return; }
    //
    //     this.width = width;
    //
    //     if (this.params.fillParent || this.params.scrollParent) {
    //         this.style(this.wrapper, {
    //             width: ''
    //         });
    //     } else {
    //         this.style(this.wrapper, {
    //             width: ~~(this.width / this.params.pixelRatio) + 'px'
    //         });
    //     }
    //
    //     this.updateSize();
    // },
    //
    // setHeight: function (height) {
    //     if (height == this.height) { return; }
    //     this.height = height;
    //     this.style(this.wrapper, {
    //         height: ~~(this.height / this.params.pixelRatio) + 'px'
    //     });
    //     this.updateSize();
    // },

    // progress: function (progress) {
    //     var minPxDelta = 1 / this.params.pixelRatio;
    //     var pos = Math.round(progress * this.width) * minPxDelta;
    //
    //     if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
    //         this.lastPos = pos;
    //
    //         if (this.params.scrollParent) {
    //             var newPos = ~~(this.wrapper.scrollWidth * progress);
    //             this.recenterOnPosition(newPos);
    //         }
    //
    //         this.updateProgress(progress);
    //     }
    // },

    // destroy: function () {
    //     this.unAll();
    //     if (this.wrapper) {
    //         this.container.removeChild(this.wrapper);
    //         this.wrapper = null;
    //     }
    // },

    /* Renderer-specific methods */
    // createElements: function () {},

    // updateSize: function () {},

    // drawWave: function (peaks, max) {},

    // clearWave: function () {},

    // updateProgress: function (position) {}
// };

// WaveSurfer.util.extend(WaveSurfer.Drawer, WaveSurfer.Observer);

// WaveSurfer.Drawer.Canvas = Object.create(WaveSurfer.Drawer);

// WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {
    // createElements: function () {
    //     var waveCanvas = this.wrapper.appendChild(
    //         this.style(document.createElement('canvas'), {
    //             position: 'absolute',
    //             zIndex: 1,
    //             left: 0,
    //             top: 0,
    //             bottom: 0
    //         })
    //     );
    //     this.waveCc = waveCanvas.getContext('2d');
    //
    //     this.progressWave = this.wrapper.appendChild(
    //         this.style(document.createElement('wave'), {
    //             position: 'absolute',
    //             zIndex: 2,
    //             left: 0,
    //             top: 0,
    //             bottom: 0,
    //             overflow: 'hidden',
    //             width: '0',
    //             display: 'none',
    //             boxSizing: 'border-box',
    //             borderRightStyle: 'solid',
    //             borderRightWidth: this.params.cursorWidth + 'px',
    //             borderRightColor: this.params.cursorColor
    //         })
    //     );
    //
    //     if (this.params.waveColor != this.params.progressColor) {
    //         var progressCanvas = this.progressWave.appendChild(
    //             document.createElement('canvas')
    //         );
    //         this.progressCc = progressCanvas.getContext('2d');
    //     }
    // },

    // updateSize: function () {
    //     var width = Math.round(this.width / this.params.pixelRatio);
    //
    //     this.waveCc.canvas.width = this.width;
    //     this.waveCc.canvas.height = this.height;
    //     this.style(this.waveCc.canvas, { width: width + 'px'});
    //
    //     this.style(this.progressWave, { display: 'block'});
    //
    //     if (this.progressCc) {
    //         this.progressCc.canvas.width = this.width;
    //         this.progressCc.canvas.height = this.height;
    //         this.style(this.progressCc.canvas, { width: width + 'px'});
    //     }
    //
    //     this.clearWave();
    // },

    // clearWave: function () {
    //     this.waveCc.clearRect(0, 0, this.width, this.height);
    //     if (this.progressCc) {
    //         this.progressCc.clearRect(0, 0, this.width, this.height);
    //     }
    // },

    // drawBars: function (peaks, channelIndex) {
    //     // Split channels
    //     if (peaks[0] instanceof Array) {
    //         var channels = peaks;
    //         if (this.params.splitChannels) {
    //             this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
    //             channels.forEach(this.drawBars, this);
    //             return;
    //         } else {
    //             peaks = channels[0];
    //         }
    //     }
    //
    //     // A half-pixel offset makes lines crisp
    //     var $ = 0.5 / this.params.pixelRatio;
    //     var width = this.width;
    //     var height = this.params.height * this.params.pixelRatio;
    //     var offsetY = height * channelIndex || 0;
    //     var halfH = height / 2;
    //     var length = ~~(peaks.length / 2);
    //     var bar = this.params.barWidth * this.params.pixelRatio;
    //     var gap = Math.max(this.params.pixelRatio, ~~(bar / 2));
    //     var step = bar + gap;
    //
    //     var absmax = 1;
    //     if (this.params.normalize) {
    //         var min, max;
    //         max = Math.max.apply(Math, peaks);
    //         min = Math.min.apply(Math, peaks);
    //         absmax = max;
    //         if (-min > absmax) {
    //             absmax = -min;
    //         }
    //     }
    //
    //     var scale = length / width;
    //
    //     this.waveCc.fillStyle = this.params.waveColor;
    //     if (this.progressCc) {
    //         this.progressCc.fillStyle = this.params.progressColor;
    //     }
    //
    //     [ this.waveCc, this.progressCc ].forEach(function (cc) {
    //         if (!cc) { return; }
    //
    //         if (this.params.reflection) {
    //             for (var i = 0; i < width; i += step) {
    //                 var h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
    //                 cc.fillRect(i + $, halfH - h + offsetY, bar + $, h * 2);
    //             }
    //         } else {
    //             for (var i = 0; i < width; i += step) {
    //                 var h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
    //                 cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
    //             }
    //
    //             for (var i = 0; i < width; i += step) {
    //                 var h = Math.round(peaks[2 * i * scale + 1] / absmax * halfH);
    //                 cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
    //             }
    //         }
    //     }, this);
    // },

    // drawWave: function (peaks, channelIndex) {
    //     // Split channels
    //     if (peaks[0] instanceof Array) {
    //         var channels = peaks;
    //         if (this.params.splitChannels) {
    //             this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
    //             channels.forEach(this.drawWave, this);
    //             return;
    //         } else {
    //             peaks = channels[0];
    //         }
    //     }
    //
    //     // A half-pixel offset makes lines crisp
    //     var $ = 0.5 / this.params.pixelRatio;
    //     var height = this.params.height * this.params.pixelRatio;
    //     var offsetY = height * channelIndex || 0;
    //     var halfH = height / 2;
    //     var length = ~~(peaks.length / 2);
    //
    //     var scale = 1;
    //     if (this.params.fillParent && this.width != length) {
    //         scale = this.width / length;
    //     }
    //
    //     var absmax = 1;
    //     if (this.params.normalize) {
    //         var min, max;
    //         max = Math.max.apply(Math, peaks);
    //         min = Math.min.apply(Math, peaks);
    //         absmax = max;
    //         if (-min > absmax) {
    //             absmax = -min;
    //         }
    //     }
    //
    //     this.waveCc.fillStyle = this.params.waveColor;
    //     if (this.progressCc) {
    //         this.progressCc.fillStyle = this.params.progressColor;
    //     }
    //
    //     [ this.waveCc, this.progressCc ].forEach(function (cc) {
    //         if (!cc) { return; }
    //
    //         cc.beginPath();
    //         cc.moveTo($, halfH + offsetY);
    //
    //         for (var i = 0; i < length; i++) {
    //             var h = Math.round(peaks[2 * i] / absmax * halfH);
    //             cc.lineTo(i * scale + $, halfH - h + offsetY);
    //         }
    //
    //         // Draw the bottom edge going backwards, to make a single
    //         // closed hull to fill.
    //         for (var i = length - 1; i >= 0; i--) {
    //             var h = Math.round(peaks[2 * i + 1] / absmax * halfH);
    //             cc.lineTo(i * scale + $, halfH - h + offsetY);
    //         }
    //
    //         cc.closePath();
    //         cc.fill();
    //
    //         // Always draw a median line
    //         cc.fillRect(0, halfH + offsetY - $, this.width, $);
    //     }, this);
    // },

    // updateProgress: function (progress) {
    //     var pos = Math.round(
    //         this.width * progress
    //     ) / this.params.pixelRatio;
    //     this.style(this.progressWave, { width: pos + 'px' });
    // }
// });
