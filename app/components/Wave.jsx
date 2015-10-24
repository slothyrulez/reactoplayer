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
    // normalize     : false,
    // audioContext  : null,
    // container     : null,
    // dragSelection : true,
    // loopSelection : true,
    // audioRate     : 1,
    // interact      : true,
    // splitChannels : false,
    // mediaContainer: null,
    // mediaControls : false,
    // renderer      : 'Canvas',
    // backend       : 'WebAudio',
    // mediaType     : 'audio'
    // this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]);
    // this.drawer.init(this.container, this.params);
    this.drawer = undefined;
    console.log(this);
  }
  getDuration() {
    return this.backend.getDuration();
  }
  render() {
    return <noscript />;
  }
}


var WaveSurfer = {
    defaultParams: {
        height        : 128,
        waveColor     : '#999',
        progressColor : '#555',
        cursorColor   : '#333',
        cursorWidth   : 1,
        skipLength    : 2,
        minPxPerSec   : 20,
        pixelRatio    : window.devicePixelRatio,
        fillParent    : true,
        scrollParent  : false,
        hideScrollbar : false,
        normalize     : false,
        audioContext  : null,
        container     : null,
        dragSelection : true,
        loopSelection : true,
        audioRate     : 1,
        interact      : true,
        splitChannels : false,
        mediaContainer: null,
        mediaControls : false,
        renderer      : 'Canvas',
        backend       : 'WebAudio',
        mediaType     : 'audio'
    },

    init: function (params) {
        // Extract relevant parameters (or defaults)
        this.params = WaveSurfer.util.extend({}, this.defaultParams, params);

        this.container = 'string' == typeof params.container ?
            document.querySelector(this.params.container) :
            this.params.container;

        if (!this.container) {
            throw new Error('Container element not found');
        }

        if (this.params.mediaContainer == null) {
            this.mediaContainer = this.container;
        } else if (typeof this.params.mediaContainer == 'string') {
            this.mediaContainer = document.querySelector(this.params.mediaContainer);
        } else {
            this.mediaContainer = this.params.mediaContainer;
        }

        if (!this.mediaContainer) {
            throw new Error('Media Container element not found');
        }

        // Used to save the current volume when muting so we can
        // restore once unmuted
        this.savedVolume = 0;
        // The current muted state
        this.isMuted = false;
        // Will hold a list of event descriptors that need to be
        // cancelled on subsequent loads of audio
        this.tmpEvents = [];

        this.createDrawer();
        this.createBackend();
    },

    createDrawer: function () {
        var my = this;

        this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]);
        this.drawer.init(this.container, this.params);

        this.drawer.on('redraw', function () {
            my.drawBuffer();
            my.drawer.progress(my.backend.getPlayedPercents());
        });

        // Click-to-seek
        this.drawer.on('click', function (e, progress) {
            setTimeout(function () {
                my.seekTo(progress);
            }, 0);
        });

        // Relay the scroll event from the drawer
        this.drawer.on('scroll', function (e) {
            my.fireEvent('scroll', e);
        });
    },

    createBackend: function () {
        // var my = this;
        //
        // if (this.backend) {
        //     this.backend.destroy();
        // }
        //
        // // Back compat
        // if (this.params.backend == 'AudioElement') {
        //     this.params.backend = 'MediaElement';
        // }
        //
        // if (this.params.backend == 'WebAudio' && !WaveSurfer.WebAudio.supportsWebAudio()) {
        //     this.params.backend = 'MediaElement';
        // }
        //
        // this.backend = Object.create(WaveSurfer[this.params.backend]);
        // this.backend.init(this.params);
        //
        // this.backend.on('finish', function () { my.fireEvent('finish'); });
        // this.backend.on('play', function () { my.fireEvent('play'); });
        // this.backend.on('pause', function () { my.fireEvent('pause'); });

        this.backend.on('audioprocess', function (time) {
            my.drawer.progress(my.backend.getPlayedPercents());
            my.fireEvent('audioprocess', time);
        });
    },

    getDuration: function () {
        return this.backend.getDuration();
    },

    getCurrentTime: function () {
        return this.backend.getCurrentTime();
    },

    play: function (start, end) {
        this.backend.play(start, end);
    },

    pause: function () {
        this.backend.pause();
    },

    playPause: function () {
        this.backend.isPaused() ? this.play() : this.pause();
    },

    isPlaying: function () {
        return !this.backend.isPaused();
    },

    skipBackward: function (seconds) {
        this.skip(-seconds || -this.params.skipLength);
    },

    skipForward: function (seconds) {
        this.skip(seconds || this.params.skipLength);
    },

    skip: function (offset) {
        var position = this.getCurrentTime() || 0;
        var duration = this.getDuration() || 1;
        position = Math.max(0, Math.min(duration, position + (offset || 0)));
        this.seekAndCenter(position / duration);
    },

    seekAndCenter: function (progress) {
        this.seekTo(progress);
        this.drawer.recenter(progress);
    },

    seekTo: function (progress) {
        var paused = this.backend.isPaused();
        // avoid small scrolls while paused seeking
        var oldScrollParent = this.params.scrollParent;
        if (paused) {
            this.params.scrollParent = false;
        }
        this.backend.seekTo(progress * this.getDuration());
        this.drawer.progress(this.backend.getPlayedPercents());

        if (!paused) {
            this.backend.pause();
            this.backend.play();
        }
        this.params.scrollParent = oldScrollParent;
        this.fireEvent('seek', progress);
    },

    stop: function () {
        this.pause();
        this.seekTo(0);
        this.drawer.progress(0);
    },

    /**
     * Set the playback volume.
     *
     * @param {Number} newVolume A value between 0 and 1, 0 being no
     * volume and 1 being full volume.
     */
    setVolume: function (newVolume) {
        this.backend.setVolume(newVolume);
    },

    /**
     * Set the playback rate.
     *
     * @param {Number} rate A positive number. E.g. 0.5 means half the
     * normal speed, 2 means double speed and so on.
     */
    setPlaybackRate: function (rate) {
        this.backend.setPlaybackRate(rate);
    },

    /**
     * Toggle the volume on and off. It not currenly muted it will
     * save the current volume value and turn the volume off.
     * If currently muted then it will restore the volume to the saved
     * value, and then rest the saved value.
     */
    toggleMute: function () {
        if (this.isMuted) {
            // If currently muted then restore to the saved volume
            // and update the mute properties
            this.backend.setVolume(this.savedVolume);
            this.isMuted = false;
        } else {
            // If currently not muted then save current volume,
            // turn off the volume and update the mute properties
            this.savedVolume = this.backend.getVolume();
            this.backend.setVolume(0);
            this.isMuted = true;
        }
    },

    toggleScroll: function () {
        this.params.scrollParent = !this.params.scrollParent;
        this.drawBuffer();
    },

    toggleInteraction: function () {
        this.params.interact = !this.params.interact;
    },

    drawBuffer: function () {
        var nominalWidth = Math.round(
            this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio
        );
        var parentWidth = this.drawer.getWidth();
        var width = nominalWidth;

        // Fill container
        if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
            width = parentWidth;
        }

        var peaks = this.backend.getPeaks(width);
        this.drawer.drawPeaks(peaks, width);
        this.fireEvent('redraw', peaks, width);
    },

    // zoom: function (pxPerSec) {
    //     this.params.minPxPerSec = pxPerSec;
    //
    //     this.params.scrollParent = true;
    //
    //     this.drawBuffer();
    //
    //     this.seekAndCenter(
    //         this.getCurrentTime() / this.getDuration()
    //     );
    // },

    /**
     * Internal method.
     */
    loadArrayBuffer: function (arraybuffer) {
        this.decodeArrayBuffer(arraybuffer, function (data) {
            this.loadDecodedBuffer(data);
        }.bind(this));
    },

    /**
     * Directly load an externally decoded AudioBuffer.
     */
    loadDecodedBuffer: function (buffer) {
        this.backend.load(buffer);
        this.drawBuffer();
        this.fireEvent('ready');
    },

    /**
     * Loads audio data from a Blob or File object.
     *
     * @param {Blob|File} blob Audio data.
     */
    loadBlob: function (blob) {
        var my = this;
        // Create file reader
        var reader = new FileReader();
        reader.addEventListener('progress', function (e) {
            my.onProgress(e);
        });
        reader.addEventListener('load', function (e) {
            my.loadArrayBuffer(e.target.result);
        });
        reader.addEventListener('error', function () {
            my.fireEvent('error', 'Error reading file');
        });
        reader.readAsArrayBuffer(blob);
        this.empty();
    },

    /**
     * Loads audio and rerenders the waveform.
     */
    load: function (url, peaks) {
        switch (this.params.backend) {
            case 'WebAudio': return this.loadBuffer(url);
            case 'MediaElement': return this.loadMediaElement(url, peaks);
        }
    },

    /**
     * Loads audio using Web Audio buffer backend.
     */
    loadBuffer: function (url) {
        this.empty();
        // load via XHR and render all at once
        return this.getArrayBuffer(url, this.loadArrayBuffer.bind(this));
    },

    loadMediaElement: function (url, peaks) {
        this.empty();
        this.backend.load(url, this.mediaContainer, peaks);

        this.tmpEvents.push(
            this.backend.once('canplay', (function () {
                this.drawBuffer();
                this.fireEvent('ready');
            }).bind(this)),

            this.backend.once('error', (function (err) {
                this.fireEvent('error', err);
            }).bind(this))
        );


        // If no pre-decoded peaks provided, attempt to download the
        // audio file and decode it with Web Audio.
        if (!peaks && this.backend.supportsWebAudio()) {
            this.getArrayBuffer(url, (function (arraybuffer) {
                this.decodeArrayBuffer(arraybuffer, (function (buffer) {
                    this.backend.buffer = buffer;
                    this.drawBuffer();
                }).bind(this));
            }).bind(this));
        }
    },

    decodeArrayBuffer: function (arraybuffer, callback) {
        this.backend.decodeArrayBuffer(
            arraybuffer,
            this.fireEvent.bind(this, 'decoded'),
            this.fireEvent.bind(this, 'error', 'Error decoding audiobuffer')
        );
        this.tmpEvents.push(
            this.once('decoded', callback)
        );
    },

    getArrayBuffer: function (url, callback) {
        var my = this;
        var ajax = WaveSurfer.util.ajax({
            url: url,
            responseType: 'arraybuffer'
        });
        this.tmpEvents.push(
            ajax.on('progress', function (e) {
                my.onProgress(e);
            }),
            ajax.on('success', callback),
            ajax.on('error', function (e) {
                my.fireEvent('error', 'XHR error: ' + e.target.statusText);
            })
        );
        return ajax;
    },

    onProgress: function (e) {
        if (e.lengthComputable) {
            var percentComplete = e.loaded / e.total;
        } else {
            // Approximate progress with an asymptotic
            // function, and assume downloads in the 1-3 MB range.
            percentComplete = e.loaded / (e.loaded + 1000000);
        }
        this.fireEvent('loading', Math.round(percentComplete * 100), e.target);
    },

    /**
     * Exports PCM data into a JSON array and opens in a new window.
     */
    exportPCM: function (length, accuracy, noWindow) {
        length = length || 1024;
        accuracy = accuracy || 10000;
        noWindow = noWindow || false;
        var peaks = this.backend.getPeaks(length, accuracy);
        var arr = [].map.call(peaks, function (val) {
            return Math.round(val * accuracy) / accuracy;
        });
        var json = JSON.stringify(arr);
        if (!noWindow) {
            window.open('data:application/json;charset=utf-8,' +
                encodeURIComponent(json));
        }
        return json;
    },

    clearTmpEvents: function () {
        this.tmpEvents.forEach(function (e) { e.un(); });
    },

    /**
     * Display empty waveform.
     */
    empty: function () {
        if (!this.backend.isPaused()) {
            this.stop();
            this.backend.disconnectSource();
        }
        this.clearTmpEvents();
        this.drawer.progress(0);
        this.drawer.setWidth(0);
        this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
    },

    /**
     * Remove events, elements and disconnect WebAudio nodes.
     */
    destroy: function () {
        this.fireEvent('destroy');
        this.clearTmpEvents();
        this.unAll();
        this.backend.destroy();
        this.drawer.destroy();
    }
};

// WaveSurfer.create = function (params) {
//     var wavesurfer = Object.create(WaveSurfer);
//     wavesurfer.init(params);
//     return wavesurfer;
// };

class CanvasDrawer {
  constructor(container, height, waveColor, progressColor){
    this.container = container;
    this.width = 0;
    this.height = height * window.devicePixelRatio;
    this.lastPos = 0;
    this.wrapper = undefined;
    this.fillParent = true;
    this.hideScrollbar = true;
    this.canvas = undefined;
    this.waveColor = waveColor;
    this.progressColor = progressColor;
  }
  style(el, styles) {
    Object.keys(styles).forEach(function (prop) {
      if (el.style[prop] !== styles[prop]) {
        el.style[prop] = styles[prop];
      }
    });
  }
  createWrapper() {
    this.wrapper = this.container.appendChild(
      document.createElement('wave');
    );
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
    this.canvas = this.wrapper.appendChild(
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
        var progressCanvas = this.progressWave.appendChild(
              document.createElement('canvas')
          );
          this.progressCc = progressCanvas.getContext('2d');
      }
  }
  resetScroll() {
    if (this.wrapper !== null) {
      this.wrapper.scrollLeft = 0;
    }
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
}

WaveSurfer.Drawer = {
    init: function (container, params) {
        this.container = container;
        this.params = params;

        this.width = 0;
        this.height = params.height * this.params.pixelRatio;

        this.lastPos = 0;

        this.createWrapper();
        this.createElements();
    },

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

    handleEvent: function (e) {
        e.preventDefault();
        var bbox = this.wrapper.getBoundingClientRect();
        return ((e.clientX - bbox.left + this.wrapper.scrollLeft) / this.wrapper.scrollWidth) || 0;
    },

    setupWrapperEvents: function () {
        var my = this;

        this.wrapper.addEventListener('click', function (e) {
            var scrollbarHeight = my.wrapper.offsetHeight - my.wrapper.clientHeight;
            if (scrollbarHeight != 0) {
                // scrollbar is visible.  Check if click was on it
                var bbox = my.wrapper.getBoundingClientRect();
                if (e.clientY >= bbox.bottom - scrollbarHeight) {
                    // ignore mousedown as it was on the scrollbar
                    return;
                }
            }

            if (my.params.interact) {
                my.fireEvent('click', e, my.handleEvent(e));
            }
        });

        this.wrapper.addEventListener('scroll', function (e) {
            my.fireEvent('scroll', e);
        });
    },

    drawPeaks: function (peaks, length) {
        this.resetScroll();
        this.setWidth(length);

        this.params.barWidth ?
            this.drawBars(peaks) :
            this.drawWave(peaks);
    },

    style: function (el, styles) {
        Object.keys(styles).forEach(function (prop) {
            if (el.style[prop] !== styles[prop]) {
                el.style[prop] = styles[prop];
            }
        });
        return el;
    },

    // resetScroll: function () {
    //     if (this.wrapper !== null) {
    //         this.wrapper.scrollLeft = 0;
    //     }
    // },

    recenter: function (percent) {
        var position = this.wrapper.scrollWidth * percent;
        this.recenterOnPosition(position, true);
    },

    recenterOnPosition: function (position, immediate) {
        var scrollLeft = this.wrapper.scrollLeft;
        var half = ~~(this.wrapper.clientWidth / 2);
        var target = position - half;
        var offset = target - scrollLeft;
        var maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;

        if (maxScroll == 0) {
            // no need to continue if scrollbar is not there
            return;
        }

        // if the cursor is currently visible...
        if (!immediate && -half <= offset && offset < half) {
            // we'll limit the "re-center" rate.
            var rate = 5;
            offset = Math.max(-rate, Math.min(rate, offset));
            target = scrollLeft + offset;
        }

        // limit target to valid range (0 to maxScroll)
        target = Math.max(0, Math.min(maxScroll, target));
        // no use attempting to scroll if we're not moving
        if (target != scrollLeft) {
            this.wrapper.scrollLeft = target;
        }

    },

    getWidth: function () {
        return Math.round(this.container.clientWidth * this.params.pixelRatio);
    },

    setWidth: function (width) {
        if (width == this.width) { return; }

        this.width = width;

        if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
                width: ''
            });
        } else {
            this.style(this.wrapper, {
                width: ~~(this.width / this.params.pixelRatio) + 'px'
            });
        }

        this.updateSize();
    },

    setHeight: function (height) {
        if (height == this.height) { return; }
        this.height = height;
        this.style(this.wrapper, {
            height: ~~(this.height / this.params.pixelRatio) + 'px'
        });
        this.updateSize();
    },

    progress: function (progress) {
        var minPxDelta = 1 / this.params.pixelRatio;
        var pos = Math.round(progress * this.width) * minPxDelta;

        if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
            this.lastPos = pos;

            if (this.params.scrollParent) {
                var newPos = ~~(this.wrapper.scrollWidth * progress);
                this.recenterOnPosition(newPos);
            }

            this.updateProgress(progress);
        }
    },

    destroy: function () {
        this.unAll();
        if (this.wrapper) {
            this.container.removeChild(this.wrapper);
            this.wrapper = null;
        }
    },

    /* Renderer-specific methods */
    createElements: function () {},

    updateSize: function () {},

    drawWave: function (peaks, max) {},

    clearWave: function () {},

    updateProgress: function (position) {}
};

// WaveSurfer.util.extend(WaveSurfer.Drawer, WaveSurfer.Observer);


class CanvasDrawer {
  constructor() {

  }
}
WaveSurfer.Drawer.Canvas = Object.create(WaveSurfer.Drawer);

WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {
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

    updateSize: function () {
        var width = Math.round(this.width / this.params.pixelRatio);

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
    },

    clearWave: function () {
        this.waveCc.clearRect(0, 0, this.width, this.height);
        if (this.progressCc) {
            this.progressCc.clearRect(0, 0, this.width, this.height);
        }
    },

    drawBars: function (peaks, channelIndex) {
        // Split channels
        if (peaks[0] instanceof Array) {
            var channels = peaks;
            if (this.params.splitChannels) {
                this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
                channels.forEach(this.drawBars, this);
                return;
            } else {
                peaks = channels[0];
            }
        }

        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.params.pixelRatio;
        var width = this.width;
        var height = this.params.height * this.params.pixelRatio;
        var offsetY = height * channelIndex || 0;
        var halfH = height / 2;
        var length = ~~(peaks.length / 2);
        var bar = this.params.barWidth * this.params.pixelRatio;
        var gap = Math.max(this.params.pixelRatio, ~~(bar / 2));
        var step = bar + gap;

        var absmax = 1;
        if (this.params.normalize) {
            var min, max;
            max = Math.max.apply(Math, peaks);
            min = Math.min.apply(Math, peaks);
            absmax = max;
            if (-min > absmax) {
                absmax = -min;
            }
        }

        var scale = length / width;

        this.waveCc.fillStyle = this.params.waveColor;
        if (this.progressCc) {
            this.progressCc.fillStyle = this.params.progressColor;
        }

        [ this.waveCc, this.progressCc ].forEach(function (cc) {
            if (!cc) { return; }

            if (this.params.reflection) {
                for (var i = 0; i < width; i += step) {
                    var h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
                    cc.fillRect(i + $, halfH - h + offsetY, bar + $, h * 2);
                }
            } else {
                for (var i = 0; i < width; i += step) {
                    var h = Math.round(peaks[Math.floor(2 * i * scale)] / absmax * halfH);
                    cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
                }

                for (var i = 0; i < width; i += step) {
                    var h = Math.round(peaks[2 * i * scale + 1] / absmax * halfH);
                    cc.fillRect(i + $, halfH - h + offsetY, bar + $, h);
                }
            }
        }, this);
    },

    drawWave: function (peaks, channelIndex) {
        // Split channels
        if (peaks[0] instanceof Array) {
            var channels = peaks;
            if (this.params.splitChannels) {
                this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
                channels.forEach(this.drawWave, this);
                return;
            } else {
                peaks = channels[0];
            }
        }

        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.params.pixelRatio;
        var height = this.params.height * this.params.pixelRatio;
        var offsetY = height * channelIndex || 0;
        var halfH = height / 2;
        var length = ~~(peaks.length / 2);

        var scale = 1;
        if (this.params.fillParent && this.width != length) {
            scale = this.width / length;
        }

        var absmax = 1;
        if (this.params.normalize) {
            var min, max;
            max = Math.max.apply(Math, peaks);
            min = Math.min.apply(Math, peaks);
            absmax = max;
            if (-min > absmax) {
                absmax = -min;
            }
        }

        this.waveCc.fillStyle = this.params.waveColor;
        if (this.progressCc) {
            this.progressCc.fillStyle = this.params.progressColor;
        }

        [ this.waveCc, this.progressCc ].forEach(function (cc) {
            if (!cc) { return; }

            cc.beginPath();
            cc.moveTo($, halfH + offsetY);

            for (var i = 0; i < length; i++) {
                var h = Math.round(peaks[2 * i] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            // Draw the bottom edge going backwards, to make a single
            // closed hull to fill.
            for (var i = length - 1; i >= 0; i--) {
                var h = Math.round(peaks[2 * i + 1] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            cc.closePath();
            cc.fill();

            // Always draw a median line
            cc.fillRect(0, halfH + offsetY - $, this.width, $);
        }, this);
    },

    // updateProgress: function (progress) {
    //     var pos = Math.round(
    //         this.width * progress
    //     ) / this.params.pixelRatio;
    //     this.style(this.progressWave, { width: pos + 'px' });
    // }
});
