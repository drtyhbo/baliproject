var PictureView = Class.extend({
  init: function(pageEl, assets, assetIdx) {
    this.assets = assets;
    this.assetIdx = assetIdx;
    
    this.pictureEl = pageEl.find('#picture');
    this.pictureEl
        .off()
        .empty();

    // The previous asset.
    this.prev = null;
    // The current asset.
    this.curr = null;
    // The next asset.
    this.next = null;
    
    this.isTouching = false;
    // The starting position of the touch.
    this.touchStartX = 0;
    // The final position of the touch.
    this.touchEndX = 0;
    
    this.screenWidth = $(window).width();
    this.screenHeight = $(window).height();    
    this.dimension =
        Math.min(this.screenWidth, this.screenHeight);
    this.startLeft = (this.screenWidth - this.dimension) / 2;

    Util.addAnimationHandler('picture-view', this.stepAnimation.bind(this));

    this.initUi();
  },
  
  createPicture: function(assetElement) {
    var el = $('<div></div>')
        .css({
          position: 'absolute',
          top: 0
        });
    
    var infoEl = $('<div></div>')
        .addClass('info')
        .css({
          fontSize: 12,
          height: 20,
          lineHeight: '20px',
          padding: 8
        })
        .appendTo(el);

    $('<div></div>')
        .css('float', 'left')
        .text(assetElement.getAssets()[0].location || '')
        .appendTo(infoEl);

    $('<div></div>')
        .css('float', 'right')
        .text(Util.getElapsedTimeStringLong(
            assetElement.getAssets()[0].timestamp))
        .appendTo(infoEl);
        
    var assetRenderer = new AssetRenderer(assetElement, true);
    assetRenderer.getEl()
        .css({
          width: this.dimension
        })
        .appendTo(el);
    assetRenderer.loadImages();
    
    return {
      el: el,
      assetRenderer: assetRenderer
    };
  },
  
  createPreviousAsset: function() {
    this.prevEl = null;
    if (!this.assetIdx) {
      return;
    }
    var prev = this.createPicture(this.assets[this.assetIdx - 1]);
    this.prev = prev.assetRenderer;
    this.prevEl = prev.el
        .css('left', -this.dimension)
        .appendTo(this.pictureEl);
  },
  
  createNextAsset: function() {
    this.nextEl = null;
    if (this.assetIdx >= this.assets.length) {
      return;
    }
    var next = this.createPicture(this.assets[this.assetIdx + 1]);
    this.next = next.assetRenderer;
    this.nextEl = next.el
        .css('left', this.screenWidth)
        .appendTo(this.pictureEl);
  },
  
  initUi: function() {
    this.createPreviousAsset();
    this.createNextAsset();

    var curr = this.createPicture(this.assets[this.assetIdx]);
    this.curr = curr.assetRenderer;
    this.currEl = curr.el
        .css('left', 0)
        .appendTo(this.pictureEl);

    this.attachTouchEvents();
  },

  attachTouchEvents: function() {
    $(this.pictureEl)
        .on(TOUCHSTART, this.touchStart.bind(this))
        .on(TOUCHMOVE, this.touchMove.bind(this))
        .on(TOUCHEND, this.touchEnd.bind(this));
  },
  
  touchStart: function(e) {
    this.pictureEl.find('.info').animate({
      opacity: 0
    }, 100);

    e.preventDefault();
    
    this.isTouching = true;
    this.touchStartX = this.touchEndX = e.originalEvent.pageX;
  },
  
  touchMove: function(e) {
    if (!this.isTouching) {
      return;
    }
    
    e.preventDefault();
    
    this.touchEndX = e.originalEvent.pageX;
    
    var deltaX = this.touchEndX - this.touchStartX;
    if (deltaX > 0 && !this.prevEl || 
        deltaX < 0 && !this.nextEl) {
      this.touchEndX = this.touchStartX;
      return;
    }

    this.currEl.css('left', this.startLeft + deltaX);
    if (this.prevEl) {
      this.prevEl.css('left', -this.dimension + deltaX);
    }
    if (this.nextEl) {
      this.nextEl.css('left', this.screenWidth + deltaX);
    }
  },
  
  touchEnd: function(e) {
    e.preventDefault();

    this.isTouching = false;
    
    var deltaX = this.touchEndX - this.touchStartX;
    if (Math.abs(deltaX) > this.screenWidth / 5) {
      // Moving left.
      if (deltaX < 0) {
        var destLeft = -this.dimension;
      // Moving right.
      } else {
        var destLeft = this.screenWidth;
      }
    } else {
      var destLeft = this.startLeft;
    }
    this.currEl.animate({
          left: destLeft,
        }, {
          complete: function() {
            if (destLeft != this.startLeft && deltaX < 0) {
              if (this.prevEl) {
                this.prevEl.remove();
              }
              this.prev = this.curr;
              this.prevEl = this.currEl;
              this.curr = this.next;
              this.currEl = this.nextEl;
              this.assetIdx++;
              this.createNextAsset();
            } else if (destLeft != this.startLeft && deltaX > 0) {
              if (this.nextEl) {
                this.nextEl.remove();
              }
              this.next = this.curr;
              this.nextEl = this.currEl;
              this.curr = this.prev;
              this.currEl = this.prevEl;
              this.assetIdx--;
              this.createPreviousAsset();
            }
            this.pictureEl.find('.info').animate({
              opacity: 1
            }, 100);
          }.bind(this),
          duration: 100,
          step: function(now, tween) {
            var t = (tween.now - tween.start) / (tween.end - tween.start);
            var distanceRemaining = destLeft - (this.startLeft + deltaX);
            if (this.nextEl) {
              this.nextEl.css('left', this.screenWidth + deltaX +
                  distanceRemaining * t);
            }
            if (this.prevEl) {
              this.prevEl.css('left', -this.dimension + deltaX +
                  distanceRemaining * t);
            }
          }.bind(this)
        });
  },

  stepAnimation: function() {
    if (this.prev) {
      this.prev.stepAnimation();
    }
    this.curr.stepAnimation();
    if (this.next) {
      this.next.stepAnimation();
    }
  }
});

PictureView.show = function (assets, assetIdx) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
      PictureView.onShow.bind(this, assets, assetIdx));
  $.mobile.pageContainer.pagecontainer('change', '#picture-view', {
    changeHash: true,
    showLoadMsg: false,
    transition: 'slide'
  });
};

PictureView.onShow = function (assets, assetIdx, event, ui) {
  $.mobile.pageContainer.off('pagecontainerbeforetransition', arguments.callee);
  new PictureView($('#picture-view'), assets, assetIdx)
};