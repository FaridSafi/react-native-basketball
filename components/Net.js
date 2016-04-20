import React, {
  View,
  StyleSheet,
  Dimensions,
  Component,
  PropTypes,
} from 'react-native';

class Net extends Component {
  render() {
    return (
      <View style={[styles.container, {
        bottom: this.props.y,
        height: this.props.height,
        width: this.props.width,
      }]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: (Dimensions.get('window').width / 2) - (83 / 2),
    backgroundColor: '#ff260f',
    borderRadius: 3,
  },
});

Net.defaultProps = {
  y: 0,
  height: 10,
  width: 10,
};

Net.propTypes = {
  y: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Net;
