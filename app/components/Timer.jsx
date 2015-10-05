import React, { PropTypes } from 'react';

export default class Timer extends React.Component {
    static prettyTime(time) {
        let hours = Math.floor(time / 3600);
        let mins = '0' + Math.floor((time % 3600) / 60);
        let secs = '0' + Math.floor((time % 60));

        mins = mins.substr(mins.length - 2);
        secs = secs.substr(secs.length - 2);

        if (!isNaN(secs)) {
            if (hours) {
                return `${hours}:${mins}:${secs}`;
            } else {
                return `${mins}:${secs}`;
            }
        } else {
            return '00:00';
        }
    }

    render() {
        let { duration, currentTime, className } = this.props;
        let classNames = ClassNames('sb-soundplayer-timer', className);

        return (
            <div className={classNames}>
                {Timer.prettyTime(currentTime)} / {Timer.prettyTime(duration)}
            </div>
        );
    }
}
