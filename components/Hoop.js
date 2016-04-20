import React, {
  View,
  StyleSheet,
  Dimensions,
  PropTypes,
  Component,
} from 'react-native';

class Hoop extends Component {
  render() {
    return (
      <View style={[styles.container, {
        bottom: this.props.y,
      }]}
      >
        <View style={styles.contained} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: (Dimensions.get('window').width / 2) - (179 / 2),
    width: 179,
    height: 112,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#b7b7b7',
    borderRadius: 4,
  },
  contained: {
    width: 70,
    height: 54,
    marginTop: 38,
    borderWidth: 5,
    borderColor: '#b7b7b7',
  },
});

Hoop.defaultProps = {
  y: 0,
};

Hoop.propTypes = {
  y: PropTypes.number,
};

export default Hoop;
