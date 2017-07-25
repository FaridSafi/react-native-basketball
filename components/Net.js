import React, {
  Component,
} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  PropTypes,
} from 'prop-types';

class Net extends Component {
  render() {
    return (
      <View style={[styles.netContainer, {
        left: this.props.x,
        bottom: this.props.y,
        height: this.props.height,
        width: this.props.width,
      }]}
      />
    );
  }
}

const styles = StyleSheet.create({
  netContainer: {
    position: 'absolute',
    backgroundColor: '#ff260f',
    borderRadius: 3,
  },
});

Net.defaultProps = {
  x: 0,
  y: 0,
  height: 10,
  width: 10,
};

Net.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Net;
