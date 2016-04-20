import React, {
  Component,
  StyleSheet,
  TouchableOpacity,
  Image,
  PropTypes,
} from 'react-native';

class Ball extends Component {

  constructor(props) {
    super(props);

    this.xIn = null;
    this.yIn = null;
    this.xOut = null;
    this.yOut = null;
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={(e) => {
          this.xIn = e.nativeEvent.locationX;
          this.yIn = e.nativeEvent.locationY;
        }}
        onPressOut={(e) => {
          if (this.xIn !== null) {
            this.xOut = e.nativeEvent.locationX;
            this.yOut = e.nativeEvent.locationY;

            const angle = Math.atan2(this.yOut - this.yIn, this.xOut - this.xIn) * 180 / Math.PI;
            this.props.onStart(angle + 90);
            // this.props.onStart(2);

            this.xIn = null;
            this.yIn = null;
            this.xOut = null;
            this.yOut = null;
          }
        }}
        style={[styles.container, {
          width: this.props.radius * 2,
          height: this.props.radius * 2,
          left: this.props.x,
          bottom: this.props.y,
        }]}
      >
        <Image source={require('../assets/ball-384.png')} style={[{
          width: this.props.radius * 2,
          height: this.props.radius * 2,
          borderRadius: this.props.radius,
          backgroundColor: '#e75c00',
          transform: [
            {rotate: this.props.rotate + 'deg'},
            {scale: this.props.scale},
          ],
        }]}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

Ball.defaultProps = {
  onStart: () => {},
  x: 0,
  y: 0,
  radius: 48,
  rotate: 0,
  scale: 1,
};

Ball.propTypes = {
  onStart: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
  radius: PropTypes.number,
  rotate: PropTypes.number,
  scale: PropTypes.number,
};

export default Ball;
