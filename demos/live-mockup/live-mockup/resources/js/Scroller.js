var FRICTION = 2;
var WEIGHT = 2;
var MIN_VELOCITY = 2;

var Point2d = Class.extend({
  init: function(x, y) {
    this.x = x;
    this.y = y;
  }
});

var Scroller = Class.extend({
  init: function(el) {
    this.el = el;
   
    el
        .bind(TOUCHSTART, this.mouseDown.bind(this))
        .bind(TOUCHMOVE, this.mouseMove.bind(this))
        .bind(TOUCHEND, this.mouseUp.bind(this));

    // When true, the user is touching the scroller, so no need to move it on
    // our own.
    this.isTouch = false;

    // The timestamp when the user began scrolling.
    this.startScrollTime = null;
    // The timestamp of the last animation frame.
    this.lastAnimationFrameTime = null;

    // The previous position of the mouse.
    this.prevMousePosition = null;
    // The timestamp of the previous mouse position.
    this.prevMouseTime = null;

    // The velocity of the scroller.
    this.scrollVelocity = null;
    // The position of the scroller.
    this.scrollPosition = new Point2d(0, 0);
  },
  
  getTouchPoint: function(e) {
    return new Point2d(
        e.pageX !== undefined ? e.pageX : e.originalEvent.touches[0].pageX,
        e.pageY !== undefined ? e.pageY : e.originalEvent.touches[0].pageY);
  },
  
  mouseDown: function(e) {
    this.isTouch = true;
  
    e.preventDefault();
    
    this.scrollVelocity = new Point2d(0, 0);
    this.prevMouseTime = new Date().getTime();

    var touchPoint = this.getTouchPoint(e);
    this.prevMousePosition = new Point2d(touchPoint.x, touchPoint.y);
  },
  
  mouseMove: function(e) {
    if (!this.isTouch) {
      return;
    }

    e.preventDefault();
    
    var touchPoint = this.getTouchPoint(e);
    var deltaTime = (new Date().getTime() - this.prevMouseTime) / 1000;
    this.scrollVelocity = new Point2d(
      (this.prevMousePosition.x - touchPoint.x) / deltaTime / WEIGHT,
      (this.prevMousePosition.y - touchPoint.y) / deltaTime / WEIGHT);

    this.scrollPosition.x += this.prevMousePosition.x - touchPoint.x;
    this.scrollPosition.y += this.prevMousePosition.y - touchPoint.y;

    this.render();
    
    this.prevMouseTime = new Date().getTime();
    this.prevMousePosition = new Point2d(touchPoint.x, touchPoint.y);
  },
  
  mouseUp: function() {
    this.isTouch = false;

    // Cancel velocity when the user moves her finger to a new location, then
    // stops. We only want velocity on a flick motion.
    var deltaTimeSec = (new Date().getTime() - this.prevMouseTime) / 1000
    if (deltaTimeSec > 0.1) {
      this.scrollVelocity = new Point2d(0, 0);
    }

    this.lastAnimationFrameTime = new Date().getTime();
    this.updateLoop();
  },
  
  updateLoop: function() {
    if (this.isTouch) {
      return;
    }

    var animationFrameTime = new Date().getTime();

    var deltaTime = (animationFrameTime - this.lastAnimationFrameTime) / 1000;
    this.scrollPosition.x += this.scrollVelocity.x * deltaTime;
    this.scrollPosition.y += this.scrollVelocity.y * deltaTime;

    this.scrollVelocity.x += -this.scrollVelocity.x * FRICTION * deltaTime;
    this.scrollVelocity.y += -this.scrollVelocity.y * FRICTION * deltaTime;
    
    if (Math.abs(this.scrollVelocity.x) < MIN_VELOCITY) {
      this.scrollVelocity.x = 0;
    }
    if (Math.abs(this.scrollVelocity.y) < MIN_VELOCITY) {
      this.scrollVelocity.y = 0;
    }

    this.lastAnimationFrameTime = animationFrameTime;

    this.render();
    
    if (Math.abs(this.scrollVelocity.x) >= MIN_VELOCITY ||
        Math.abs(this.scrollVelocity.y) >= MIN_VELOCITY) {
      window.requestAnimationFrame(this.updateLoop.bind(this));
    }
  },
  
  render: function() {
    var contentHeight = this.el.height();
    var parentHeight = this.el.parent().height();

    if (this.scrollPosition.y < 0) {
      this.scrollPosition.y = 0;
    }
    if (this.scrollPosition.y > contentHeight - parentHeight) {
      this.scrollPosition.y = contentHeight - parentHeight;
    }

    this.el.css('transform', 'translate3d(0, ' + -this.scrollPosition.y + 'px, 0)');
  }
});