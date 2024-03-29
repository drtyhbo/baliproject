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
        .bind(TOUCHEND, this.mouseUp.bind(this))
        .bind('mousewheel', this.mouseWheel.bind(this));

    // When true, the user is touching the scroller, so no need to move it on
    // our own.
    this.isTouch = false;

    // The timestamp when the user began scrolling.
    this.startScrollTime = null;
    // The timestamp of the last animation frame.
    this.lastAnimationFrameTime = 0;

    // The previous position of the mouse.
    this.prevMousePosition = null;
    // The timestamp of the previous mouse position.
    this.prevMouseTime = null;

    // The velocity of the scroller.
    this.scrollVelocity = new Point2d(0, 0);
    // The last position of the scroller.
    this.lastScrollPosition = null;
    // The position of the scroller.
    this.scrollPosition = new Point2d(0, 0);
    
    // A list of callbacks to fire on scroll.
    this.callbacks = [];
    
    this.updateLoop();
  },
  
  /**
   * Returns the scrollable element.
   */
  getEl: function() {
    return this.el;
  },

  /**
   * Returns the offset of the container element.
   */
  getContainerOffset: function() {
    return this.el.parent().offset();
  },
  
  /**
   * Returns the height of the container element.
   */
  getContainerHeight: function() {
    return this.el.parent().height();
  },

  /**
   * Returns the current scroll position.
   */
  getScrollPosition: function() {
    return this.scrollPosition;
  },
  
  /**
   * Call this when the height of the content has changed.
   */  
  updateHeight: function() {
    this.lastScrollPosition = null;
    this.render();
  },
  
  /**
   * Use the jQuery scroll() function to bind a scroll callback.
   */
  scroll: function(callback) {
    this.callbacks.push(callback);
  },

  getTouchPoint: function(e) {
    return new Point2d(
        e.pageX !== undefined ? e.pageX : e.originalEvent.touches[0].pageX,
        e.pageY !== undefined ? e.pageY : e.originalEvent.touches[0].pageY);
  },
  
  mouseWheel: function(e) {
    e.preventDefault();
    
    if (!this.lastAnimationFrameTime) {
      this.lastAnimationFrameTime = new Date().getTime();            
    }
    this.scrollVelocity =
        new Point2d(0, -e.originalEvent.wheelDeltaY * 10);
    this.updateLoop();
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
    } else {
      this.lastAnimationFrameTime = 0;
    }
  },
  
  render: function() {
    if (this.lastScrollPosition &&
        this.scrollPosition.x == this.lastScrollPosition.x &&
        this.scrollPosition.y == this.lastScrollPosition.y) {
      return;
    }
    var contentHeight = this.el.height();
    var containerHeight = this.getContainerHeight();

    if (this.scrollPosition.y > contentHeight - containerHeight) {
      this.scrollPosition.y = contentHeight - containerHeight;
    }
    if (this.scrollPosition.y < 0) {
      this.scrollPosition.y = 0;
    }
    
    this.lastScrollPosition =
        new Point2d(this.scrollPosition.x, this.scrollPosition.y);

    for (var i = 0, callback; callback = this.callbacks[i]; i++) {
      callback();
    }

    this.el.css('transform', 'translate3d(0, ' + -this.scrollPosition.y + 'px, 0)');
  }
});