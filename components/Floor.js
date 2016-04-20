import React, {
  View,
  StyleSheet,
  Dimensions,
  Component,
  PropTypes,
} from 'react-native';

class Floor extends Component {
  render() {
    return (
      <View style={[styles.container, {height: this.props.height}]} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F4',
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
  },
});

Floor.defaultProps = {
  heght: 10,
};

Floor.propTypes = {
  height: PropTypes.number,
};

export default Floor;
