import React, {
  Component,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';

import Ball from './components/Ball';
import Hoop from './components/Hoop';
import Net from './components/Net';
import Floor from './components/Floor';

// physical variables
const gravity = 0.28; // gravity
const velocityReduction = 0.6; // velocity reduction factor per bounce
const radius = 48; // ball radius
const rotationFactor = 10; // ball rotation factor

// components sizes and positions
const FLOOR_HEIGHT = 48;
const FLOOR_Y = 11;
const HOOP_Y = Dimensions.get('window').height - 227;
const NET_Y = Dimensions.get('window').height - 216;
const NET_HEIGHT = 5;
const NET_WIDTH = 83;

// ball lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;
const LC_FALLING = 2;
const LC_BOUNCING = 3;
const LC_RESTARTING = 4;
const LC_RESTARTING_FALLING = 5;

// TODO
// ALL calculation using radius should use scale
// test android ipad
// eslint

class Basketball extends Component {

  constructor(props) {
    super(props);

    this.interval = null;

    // initialize ball states
    this.state = {
      x: Dimensions.get('window').width / 2 - radius,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      rotate: 0,
      scale: 1,
      lifecycle: LC_WAITING,
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.update.bind(this), 1000 / 60);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onStart(angle) {
    if (this.state.lifecycle === LC_WAITING) {
      this.setState({
        vx: angle * 0.2,
        vy: -15,
        lifecycle: LC_STARTING,
      });
    }
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  circlesColliding(x1, y1, radius1, x2, y2, radius2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let radii = radius1 + radius2;
    if ( ( dx * dx ) + ( dy * dy ) < radii * radii ) {
      return true;
    } else {
      return false;
    }
  }

  // collision
  // let bounced = this.state.bounced;
  // bouncing
  // vy = vy * -velocityReduction;
  handleCollision(nextState) {

  }

  updateVelocity(nextState) {
    nextState.vx = this.state.vx;
    nextState.vy = this.state.vy + gravity;
  }

  updatePosition(nextState) {
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;
    if (nextState.lifecycle === LC_STARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_FALLING;
    }
    if (nextState.lifecycle === LC_RESTARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_RESTARTING_FALLING;
    }
  }

  updateScale(nextState) {
    if (nextState.lifecycle === LC_BOUNCING || nextState.lifecycle === LC_RESTARTING || nextState.lifecycle === LC_RESTARTING_FALLING) return;

    let scale = this.state.scale;
    if (scale > 0.4 && this.state.y > FLOOR_HEIGHT) {
      scale -= 0.007;
    }

    nextState.scale = scale;
  }

  updateRotate(nextState) {
    nextState.rotate = this.state.rotate + (nextState.vx * rotationFactor);
  }

  handleRestart(nextState) {
    if (nextState.lifecycle === LC_RESTARTING_FALLING && nextState.y <= FLOOR_Y) {
      nextState.lifecycle = LC_WAITING;
      nextState.y = FLOOR_Y;
      nextState.vx = 0;
      nextState.vy = 0;
      nextState.rotate = 0;
      nextState.scale = 1;
    }

    if (
      (nextState.x > Dimensions.get('window').width + 100 || nextState.x < 0 - (radius * 2) - 100)
      || ((nextState.lifecycle === LC_FALLING || nextState.lifecycle === LC_BOUNCING) && (nextState.y + (radius * nextState.scale * 2) < FLOOR_Y + radius * -2))
    ) {
      nextState.y = FLOOR_Y;
      // nextState.y = FLOOR_Y + radius * -2;
      nextState.x = this.randomIntFromInterval(4, Dimensions.get('window').width - (radius * 2) - 4);
      nextState.vy = -5;
      nextState.vx = 0;
      nextState.scale = 1;
      nextState.rotate = 0;
      nextState.lifecycle = LC_RESTARTING;
    }
  }

  update() {
    if (this.state.lifecycle === LC_WAITING) return;

    let nextState = Object.assign({}, this.state);
    this.updateVelocity(nextState);
    this.updatePosition(nextState);
    this.updateScale(nextState);
    this.updateRotate(nextState);

    this.handleCollision(nextState);
    this.handleRestart(nextState);

    this.setState(nextState);
  }

  renderNet(render) {
    if (render === true) {
      return (
        <Net y={NET_Y} height={NET_HEIGHT} width={NET_WIDTH} />
      );
    }
    return null;
  }

  renderFloor(render) {
    if (this.state.lifecycle === LC_RESTARTING || this.state.lifecycle === LC_RESTARTING_FALLING) {
      render = !render;
    }

    if (render === true) {
      return (
        <Floor height={FLOOR_HEIGHT} />
      );
    }
    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <Hoop y={HOOP_Y} />
        {this.renderNet(this.state.vy < 0)}
        {this.renderFloor(this.state.vy <= 0)}
        <Ball
          onStart={this.onStart.bind(this)}
          x={this.state.x}
          y={this.state.y}
          radius={radius}
          rotate={this.state.rotate}
          scale={this.state.scale}
        />
        {this.renderNet(this.state.vy >= 0)}
        {this.renderFloor(this.state.vy > 0)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Basketball;
