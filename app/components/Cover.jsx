import ClassNames from 'classnames';
let { PropTypes, Component } = React;

export default class Cover extends React.Component {
  render() {
      let { backgroundUrl, trackName, artistName, className, children } = this.props;
      let classNames = ClassNames('sb-soundplayer-cover', className);

      return (
          <div style={{backgroundImage: `url(${backgroundUrl})`}} className={classNames}>
              <div>
                  <SoundCloudLogoSVG />
              </div>
              <div>
                  <span className="sb-soundplayer-track sb-soundplayer-info-box">{trackName}</span>
              </div>
              <div>
                  <span className="sb-soundplayer-artist sb-soundplayer-info-box">by {artistName}</span>
              </div>
              {React.Children.map(children, React.addons.cloneWithProps)}
          </div>
      );
  }
}

Cover.propTypes = {
    className: PropTypes.string,
    backgroundUrl: PropTypes.string.isRequired,
    trackName: PropTypes.string.isRequired,
    artistName: PropTypes.string.isRequired
};
