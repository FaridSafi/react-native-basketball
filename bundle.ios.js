// a bundle version for react native playground


import React, {
  AppRegistry,
  Component,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  PropTypes,
  Animated,
  Text,
} from 'react-native';

// physical variables
const gravity = 0.34; // gravity
const radius = 48; // ball radius
const rotationFactor = 10; // ball rotation factor

// components sizes and positions
const FLOOR_HEIGHT = 48;
const FLOOR_Y = 11;
const HOOP_Y = Dimensions.get('window').height - 227;
const NET_HEIGHT = 6;
const NET_WIDTH = 83;
const NET_Y = Dimensions.get('window').height - 216;
const NET_X = (Dimensions.get('window').width / 2) - (NET_WIDTH / 2);
const NET_LEFT_BORDER_X = NET_X + NET_HEIGHT / 2;
const NET_LEFT_BORDER_Y = NET_Y;
const NET_RIGHT_BORDER_X = NET_X + NET_WIDTH - NET_HEIGHT / 2;
const NET_RIGHT_BORDER_Y = NET_LEFT_BORDER_Y;

// ball lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;
const LC_FALLING = 2;
const LC_BOUNCING = 3;
const LC_RESTARTING = 4;
const LC_RESTARTING_FALLING = 5;

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
      scored: null,
      score: 0,
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
        vy: -16,
        lifecycle: LC_STARTING,
      });
    }
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  circlesColliding(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
      return true;
    }
    return false;
  }

  // Inspired by http://www.adambrookesprojects.co.uk/project/canvas-collision-elastic-collision-tutorial/
  updateCollisionVelocity(nextState, ball, netBorder) {
    const xDistance = (netBorder.x - ball.x);
    const yDistance = (netBorder.y - ball.y);
    let normalVector = new Vector(xDistance, yDistance);
    normalVector = normalVector.normalise();

    const tangentVector = new Vector((normalVector.getY() * -1), normalVector.getX());

    // create ball scalar normal direction.
    const ballScalarNormal = normalVector.dot(ball.velocity);
    const netScalarNormal = normalVector.dot(netBorder.velocity);

    // create scalar velocity in the tagential direction.
    const ballScalarTangential = tangentVector.dot(ball.velocity);

    const ballScalarNormalAfter = (ballScalarNormal * (ball.mass - netBorder.mass) +
     2 * netBorder.mass * netScalarNormal) / (ball.mass + netBorder.mass);

    const ballScalarNormalAfterVector = normalVector.multiply(ballScalarNormalAfter);
    const ballScalarNormalVector = (tangentVector.multiply(ballScalarTangential));

    const nextVelocity = ballScalarNormalVector.add(ballScalarNormalAfterVector);

    if (ball.y < NET_Y + NET_HEIGHT / 2) {
      nextState.vx = nextVelocity.x;
    } else {
      nextState.vx = -nextVelocity.x;
    }

    nextState.vy = nextVelocity.y;
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;
  }

  handleCollision(nextState) {
    if (nextState.lifecycle !== LC_FALLING && nextState.lifecycle !== LC_BOUNCING) return;

    const _self = this;

    const ball = {
      x: nextState.x + radius,
      y: nextState.y + radius,
      radius: radius * nextState.scale,
      velocity: {
        getX() {
          return _self.state.vx;
        },
        getY() {
          return _self.state.vy;
        },
      },
      mass: 2,
    };
    const netLeftBorder = {
      x: NET_LEFT_BORDER_X,
      y: NET_LEFT_BORDER_Y,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };
    const netRightBorder = {
      x: NET_RIGHT_BORDER_X,
      y: NET_RIGHT_BORDER_Y,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };

    const isLeftCollision = this.circlesColliding(ball, netLeftBorder);
    if (isLeftCollision) {
      nextState.lifecycle = LC_BOUNCING;
      this.updateCollisionVelocity(nextState, ball, netLeftBorder);
    } else {
      const isRightCollision = this.circlesColliding(ball, netRightBorder);
      if (isRightCollision) {
        nextState.lifecycle = LC_BOUNCING;
        this.updateCollisionVelocity(nextState, ball, netRightBorder);
      }
    }
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

    if (this.state.scored === null) {
      if (this.state.y + radius > NET_Y + NET_HEIGHT / 2 && nextState.y + radius < NET_Y + NET_HEIGHT / 2) {
        if (nextState.x + radius > NET_LEFT_BORDER_X && nextState.x + radius < NET_RIGHT_BORDER_X) {
          nextState.scored = true;
          nextState.score += 1;
        } else {
          nextState.scored = false;
        }
      }
    }
  }

  updateScale(nextState) {
    if (nextState.lifecycle === LC_BOUNCING || nextState.lifecycle === LC_RESTARTING || nextState.lifecycle === LC_RESTARTING_FALLING) return;

    let scale = this.state.scale;
    if (scale > 0.4 && this.state.y > FLOOR_HEIGHT) {
      scale -= 0.006;
    }

    nextState.scale = scale;
  }

  updateRotate(nextState) {
    nextState.rotate = this.state.rotate + (nextState.vx * rotationFactor);
  }

  handleRestart(nextState) {
    if (nextState.lifecycle === LC_RESTARTING_FALLING && nextState.y <= FLOOR_Y) {
      // in front of the Floor
      // will restart to 'Waiting' lifecycle step
      nextState.y = FLOOR_Y;
      nextState.vx = 0;
      nextState.vy = 0;
      nextState.rotate = 0;
      nextState.scale = 1;
      nextState.lifecycle = LC_WAITING;

      nextState.scored = null;
    }

    const outOfScreen = (nextState.x > Dimensions.get('window').width + 100 || nextState.x < 0 - (radius * 2) - 100);

    if (
      (outOfScreen === true)
      || ((nextState.lifecycle === LC_FALLING || nextState.lifecycle === LC_BOUNCING) && (nextState.y + (radius * nextState.scale * 2) < FLOOR_Y + radius * -2))
    ) {
      if (outOfScreen && nextState.scored === null) {
        nextState.scored = false;
      }

      // behind the Floor
      // will be thrown to the front of the floor
      nextState.y = FLOOR_Y;

      if (nextState.scored === true) {
        nextState.x = this.randomIntFromInterval(4, Dimensions.get('window').width - (radius * 2) - 4);
      } else {
        nextState.x = Dimensions.get('window').width / 2 - radius;
        nextState.score = 0;
      }

      // nextState.x = Dimensions.get('window').width / 2 - radius;
      nextState.vy = -6;
      nextState.vx = 0;
      nextState.scale = 1;
      nextState.rotate = 0;
      nextState.lifecycle = LC_RESTARTING;
    }
  }

  update() {
    if (this.state.lifecycle === LC_WAITING) return;

    let nextState = null;
    nextState = Object.assign({}, this.state);
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
        <Net y={NET_Y} x={NET_X} height={NET_HEIGHT} width={NET_WIDTH} />
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
        <Score y={FLOOR_HEIGHT * 3} score={this.state.score} scored={this.state.scored} />
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
        <Emoji y={NET_Y} scored={this.state.scored} />
      </View>
    );
  }
}

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
        style={[styles.ballContainer, {
          width: this.props.radius * 2,
          height: this.props.radius * 2,
          left: this.props.x,
          bottom: this.props.y,
        }]}
      >
        <Image source={{uri: 'https://raw.githubusercontent.com/FaridSafi/react-native-basketball/master/assets/ball-384.png'}} style={[{
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

const happy = ['👋', '👌', '👍', '👏', '👐'];
const sad = ['😢', '😓', '😒', '😳', '😭'];
const INITIAL_Y = 5;


class Emoji extends Component {

  constructor(props) {
    super(props);

    this.state = {
      relativeY: new Animated.Value(INITIAL_Y),
      fadeAnim: new Animated.Value(0),
      emoji: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scored !== null && this.props.scored === null) {
      if (nextProps.scored === true) {
        this.setState({
          emoji: this.getEmoji(true),
        });
      } else {
        this.setState({
          emoji: this.getEmoji(false),
        });
      }

      this.state.relativeY.setValue(INITIAL_Y);

      Animated.timing(
        this.state.fadeAnim,
        {toValue: 1}
      ).start();

      Animated.timing(
        this.state.relativeY,
        {toValue: 15}
      ).start();
    } else if (nextProps.scored === null && this.props.scored !== null) {
      Animated.timing(
        this.state.fadeAnim,
        {toValue: 0}
      ).start();

      Animated.timing(
        this.state.relativeY,
        {toValue: 40}
      ).start();
    }
  }

  getEmoji(isHappy = true) {
    const min = 0;
    const max = 4;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;

    if (isHappy === true) {
      return happy[random];
    }
    return sad[random];
  }

  render() {
    return (
      <View style={[styles.emojiContainer, {
        bottom: this.props.y,
        width: 100,
        height: 100,
        left: Dimensions.get('window').width / 2 - 50,
      }]}
      >
        <Animated.Text style={[{
          fontSize: 35,
          backgroundColor: 'transparent',

          opacity: this.state.fadeAnim,
          marginBottom: this.state.relativeY,
        }]}
        >
          {this.state.emoji}
        </Animated.Text>
      </View>
    );
  }
}

Emoji.defaultProps = {
  y: 0,
  scored: null,
};

Emoji.propTypes = {
  y: PropTypes.number,
  scored: PropTypes.bool,
};


class Floor extends Component {
  render() {
    return (
      <View style={[styles.floorContainer, {height: this.props.height}]} />
    );
  }
}

Floor.defaultProps = {
  heght: 10,
};

Floor.propTypes = {
  height: PropTypes.number,
};


class Hoop extends Component {
  render() {
    return (
      <View style={[styles.hoopContainer, {
        bottom: this.props.y,
      }]}
      >
        <View style={styles.hoopContained} />
      </View>
    );
  }
}

Hoop.defaultProps = {
  y: 0,
};

Hoop.propTypes = {
  y: PropTypes.number,
};


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


class Score extends Component {
  render() {
    return (
      <View style={[styles.scoreContainer, {
        bottom: this.props.y,
        width: Dimensions.get('window').width,
      }]}
      >
        <Text style={[{
          flex: 1,
          fontSize: 130,
          fontWeight: '100',
          color: '#707070',
        }]}
        >
          {this.props.score}
        </Text>
      </View>
    );
  }
}

Score.defaultProps = {
  y: 0,
  scored: null,
  score: 0,
};

Score.propTypes = {
  y: PropTypes.number,
  scored: PropTypes.bool,
  score: PropTypes.number,
};

var Vector = (
	function () {
	    var x;
	    var y;
	    function vector() { };
	    function vector(x, y) {
	        // vector constructor
	        this.setX(x);
	        this.setY(y);
	    };
        //getters and setters
	    vector.prototype.getX = function () {return this.x; };
	    vector.prototype.setX = function (x) { this.x = x; };

	    vector.prototype.getY = function () { return this.y;};
	    vector.prototype.setY = function (y) { this.y = y; };

	    vector.prototype.setXandY = function (x, y) {
	        this.setX(x);
	        this.setY(y);
	        return this;
	    }
	    vector.prototype.getMagnitude = function(){ return this.magnitude; }


        // Vector functions
	    vector.prototype.add = function(otherVector){
	        var newX = this.getX() + otherVector.getX();
	        var newY = this.getY() + otherVector.getY();
	        return new vector(newX, newY);
	    }

	    vector.prototype.subtract = function (otherVector) {
	        var newX = this.getX() - otherVector.getX();
	        var newY = this.getY() - otherVector.getY();
	        return new vector(newX, newY);
	    }

	    vector.prototype.multiply = function (scalar) {
	        var newX = this.getX() * scalar;
	        var newY = this.getY() * scalar;
	        //this.setX(this.getX() * scalar);
	        //this.setY(this.getY() * scalar);
	        return new vector(newX,newY);
	    }

	    vector.prototype.divide = function (scalar) {
	        this.setX(this.getX() / scalar);
	        this.setY(this.getY() / scalar);
	        return new vector(this.x, this.y);
	    }

	    vector.prototype.normalise = function () {
	        var newX = this.x;
	        var newY = this.y;
	        var xsquared = this.x * this.x;
	        var ysquared = this.y * this.y;
	        var distance = Math.sqrt(xsquared + ysquared);
	        newX = newX * (1.0 / distance);
	        newY = newY * (1.0 / distance);
	        return new vector(newX, newY);
	    }

	    vector.prototype.magnitude = function () {
	        var magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	        return magnitude;
	    }

	    vector.prototype.dot = function (otherVector) {
	        var dotProduct = ((this.x * otherVector.getX()) + (this.y * otherVector.getY()));
	        return dotProduct;
	        //var newX = this.x * otherVector.getX();
	        //var newY = this.y * otherVector.getY();
	        //return new vector(newX,newY);
	    }

	    return vector;
	}
)();


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ballContainer: {
    position: 'absolute',
  },
  emojiContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  floorContainer: {
    backgroundColor: '#F4F4F4',
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
  },
  hoopContainer: {
    position: 'absolute',
    left: (Dimensions.get('window').width / 2) - (179 / 2),
    width: 179,
    height: 112,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#b7b7b7',
    borderRadius: 4,
  },
  hoopContained: {
    width: 70,
    height: 54,
    marginTop: 38,
    borderWidth: 5,
    borderColor: '#b7b7b7',
  },
  netContainer: {
    position: 'absolute',
    backgroundColor: '#ff260f',
    borderRadius: 3,
  },
  scoreContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});


AppRegistry.registerComponent('SampleApp', () => Basketball);
