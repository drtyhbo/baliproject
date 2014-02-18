var PICTURE_SPACING = 2;
var USE_VARIOUS_SPACING_UI = false;
var LOAD_IMAGES_DELAY_MS = 250;
// Assets with timestamps smaller than this will be combined into a single
// asset element when using fancy pants rendering.
var FANCY_PANTS_TIME_DELTA_SEC = 15;

var SMALL_PICTURE = 1;
var MEDIUM_PICTURE = 2;
var LARGE_PICTURE = 3;
var EXTRA_LARGE_PICTURE = 4;

/**
 * This class is used to render arbitrarily long lists of vertical elements
 * in a way that doesn't bog down the system. It does this by only creating
 * elements when they are needed, and by only showing those elements when
 * they are in the viewport.
 *
 * This class must be subclassed.
 */
var VisibleElementRenderer = Class.extend({
  init: function(headerEl) {
    this.el = null;

    this.headerEl = headerEl;
    this.headerHeight = 0;
    
    // The content above what is currently visible.
    this.aboveEl = null;
    // The content that is visible.
    this.visibleEl = null;
    // The content below what is currently visible.
    this.belowEl = null;
    // The top position for each element.
    this.tops = [];
    this.height = 0;
    this.elements = this.getElements();
    this.visibleElements = null;
  },

  /**************************
   *
   * OVERRIDE THESE FUNCTIONS!!!
   *
   **************************/

  /**
   * Return the list of elements whose rendering should be managed by
   * VisibleElementRenderer. MUST BE IMPLEMENTED.
   */
  getElements: function() {
    throw 'VisibleElementRendered must be subclassed. ' +
        'getElements must be implemented.';
  },

  /**
   * Called when an element is either made visible or made hidden.
   */
  showElement: function(shown, element) {
    // Implementation of this function is optional.
  },
  
  /**************************
   *
   * END OVERRIDE
   *
   **************************/

  getVisibleElements: function() {
    if (this.visibleElements) {
      return this.visibleElements;
    }
    
    if (!this.visibleRange) {
      return [];
    }

    this.visibleElements = [];
    for (var i = this.visibleRange.firstIndex; i <= this.visibleRange.lastIndex;
        i++) {
      if ('getVisibleElements' in this.elements[i]) {
        this.visibleElements =
            this.visibleElements.concat(this.elements[i].getVisibleElements());
      }
    }
    return this.visibleElements;
  },

  /**
   * Calculates the height of all the managed elements.
   */
  calculateHeight: function() {
    var height = 0;
    for (var i = 0, element; element = this.elements[i]; i++) {
      height += element.getHeight();
    }

    if (!this.headerEl) {
      return height;
    }
    
    // This is GHETTO. Figure out a better way to do this.
    this.headerEl
        .css('visibility', 'hidden')
        .appendTo($(document.body));

    this.headerHeight = this.headerEl.height();
    height += this.headerHeight;

    this.headerEl
        .detach()
        .css('visibility', 'visible');

    return height;
  },

  /**
   * Returns the height of all the managed elements.
   */
  getHeight: function() {
    if (!this.height) {
      this.height = this.calculateHeight();
    }
    return this.height;
  },

  getEl: function() {
    if (this.el) {
      return this.el;
    }
        
    this.el = $('<div></div>')
        .css('height', this.getHeight() + 'px');
    if (this.headerEl) {
      this.headerEl.appendTo(this.el);
    }
    this.aboveEl = $('<div></div>')
        .appendTo(this.el);
    this.visibleEl = $('<div></div>')
        .appendTo(this.el);
    this.belowEl = $('<div></div>')
        .appendTo(this.el);

    var top = 0;
    for (var i = 0, element; element = this.elements[i]; i++) {
      this.tops[i] = top;
      top += element.getHeight();
    }

    return this.el;
  },

  determineVisibleRange: function(viewportTop, viewportHeight) {
    viewportTop -= this.headerHeight;
    
    // A negative viewportTop means the picture selector is further down on the
    // page, perhaps all the way off the screen.
    if (viewportTop < 0 && viewportTop < -viewportHeight) {
      // Not visible.
      return null;
    }

    // Do a binary search to find the topmost element that is within the
    // viewport.
    var low = 0;
    var high = this.elements.length - 1;
    while (low != high) {
      var mid = Math.floor((low + high) / 2);

      var top = this.tops[mid];
      // This element is above the viewport so none of the elements that come
      // before it are what we're looking for.
      if (top + this.elements[mid].getHeight() < viewportTop) {
        low = mid + 1;
      // This element is at least above the viewport so none of the elements
      // that come after it are what we're looking for.
      } else {
        high = mid;
      }
    }

    // Find the last element that is within the viewport.
    var firstIndex = low;
    var lastIndex = low;
    var viewportBottom = viewportTop + this.headerHeight + viewportHeight;
    for (var i = firstIndex + 1, element; element = this.elements[i]; i++) {
      if (this.tops[i] < viewportBottom) {
        lastIndex = i;
      }
    }

    return {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }
  },

  clearHiddenElements: function(visibleRange) {
    for (var i = this.visibleRange.firstIndex;
        i < this.visibleRange.lastIndex; i++) {
      if (i < visibleRange.firstIndex || i >= visibleRange.lastIndex) {
        this.showElement(false, this.elements[i]);
        this.elements[i].getEl().detach();
      }
    }
  },

  insertVisibleElements: function(visibleRange) {
    var insertAfter = null;
    for (var i = visibleRange.firstIndex; i <= visibleRange.lastIndex;
        i++) {
      var element = this.elements[i];
      var elementEl = element.getEl();
      // An element with a parent is already in the DOM so can be ignored.
      if (!elementEl.parent().length) {
        if (!insertAfter) {
          this.visibleEl.prepend(elementEl);
        } else {
          elementEl.insertAfter(insertAfter);
        }
        this.showElement(true, element);
      }

      insertAfter = elementEl;
    }
  },

  /**
   * viewportTop is expected to be relative to the top of this element. A value
   * of 0 assumes this element is at the very top of the viewport. A negative
   * value means this element is below the top. A positive value means it's
   * above the top.
   */
  updateVisibleElements: function(viewportTop, viewportHeight) {
    var visibleRange =
        this.determineVisibleRange(viewportTop, viewportHeight);

    if (this.visibleRange) {
      this.clearHiddenElements(visibleRange);
    }
    
    if (!visibleRange) {
      return;
    }

    if (!this.visibleRange ||
        visibleRange.firstIndex != this.visibleRange.firstIndex ||
        visibleRange.lastIndex != this.visibleRange.lastIndex) {
      this.visibleElements = null;

      // The content inside visibleEl will change so we must update the heights
      // of the other two divs to remain a constant overall height.
      this.aboveEl.css('height', this.tops[visibleRange.firstIndex] + 'px');
      this.belowEl.css('height',
          this.height - (this.tops[visibleRange.lastIndex] +
              this.elements[visibleRange.lastIndex].getHeight()) + 'px');
      this.insertVisibleElements(visibleRange);

      this.visibleRange = visibleRange;
    }

    // The child elements may in fact be VisibleElementRenderer subclasses,
    // so make sure to propagate this update down the tree.
    for (var i = visibleRange.firstIndex; i <= visibleRange.lastIndex;
        i++) {
      var element = this.elements[i];
      if (!('updateVisibleElements' in element)) {
        break;
      }
      // We must recalculate all visible elements if any children are
      // VisibleElementRenderers.
      this.visibleElements = null;
      element.updateVisibleElements(
          viewportTop - this.tops[i], viewportHeight);
    }
  }
});

var AssetRenderer = Class.extend({
  init: function (asset) {
    // Create an AssetRenderer from another AssetRenderer. Copy constructor
    // mofo!
    if (asset instanceof AssetRenderer) {
      var assetRenderer = asset;
      this.assets = assetRenderer.assets;
      this.nextAsset = assetRenderer.nextAsset;
      this.nextAnimationTime = assetRenderer.nextAnimationTime;
    } else {
      this.assets = [];
    
      if (!(asset instanceof Array)) {
        asset = [asset];
      }
      for (var i = 0; i < asset.length; i++) {
        this.addAsset(asset[i]);
      }

      this.nextAsset = 1;
      // The time when the next animation should fire.
      this.nextAnimationTime = 0;
    }

    this.el = null;
    this.imageEl = null;
    // We preload the next image in the animation to improve the loading speed
    // of the images.
    this.nextImageEl = null;

    // True when the images have been loaded for this asset.
    this.imagesLoaded = false;
  },

  getEl: function () {
    if (this.el) {
      return this.el;
    }    
    this.el = $('<span></span>')
        .css({
            display: 'inline-block',
            position: 'relative'
        });
        
    this.imageEl = this.getImageEl()
          .appendTo(this.el);
    if (this.assets.length > 1) {
      this.nextImageEl = this.getImageEl()
          .css('opacity', 0)
          .appendTo(this.el);
    }

    return this.el;
  },

  getImageEl: function(url) {
    return $('<span></span>')
        .css({
          background: '#eee',
          backgroundSize: 'cover',
          backgroundImage: url ? 'url(' + url + ')' : 'none',
          display: 'inline-block',
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%'
        });
  },

  addAsset: function(asset) {
    this.assets.push(asset);
  },

  getAssets: function() {
    return this.assets;
  },

  getNumFrames: function() {
      return this.assets.length;
  },

  stepAnimation: function() {
    if (!this.nextImageEl)
      return;
      
    // This animation is not ready to fire.
    if (this.nextAnimationTime &&
        new Date().getTime() < this.nextAnimationTime) {
      return;
    }

    var currentAssetTimestamp = this.assets[this.nextAsset].timestamp;
    this.nextAsset = (this.nextAsset + 1) % this.assets.length;
    var deltaAssetTimeSec = Math.abs(this.assets[this.nextAsset].timestamp -
        currentAssetTimestamp);
    var timeToNextAnimationMs =
        Math.max(Math.min(3000,
              deltaAssetTimeSec / FANCY_PANTS_TIME_DELTA_SEC * 3000), 2000);
    this.nextAnimationTime = new Date().getTime() + timeToNextAnimationMs;

    this.nextImageEl.animate({
      opacity: 1
    }, timeToNextAnimationMs / 2, function() {
      this.imageEl.remove();
      this.imageEl = this.nextImageEl;
      this.nextImageEl = this.getImageEl(this.assets[this.nextAsset].getSrc())
          .css('opacity', 0)
          .appendTo(this.el);
    }.bind(this))
  },

  loadImages: function() {
    var currentAsset = this.nextAsset - 1 < 0 ?
        this.assets.length - 1 : this.nextAsset - 1;
    this.imageEl.css('background-image', 'url(' +
        this.assets[currentAsset].getSrc() + ')');
    if (this.nextImageEl) {
      this.nextImageEl.css('background-image',
          'url(' + this.assets[this.nextAsset].getSrc() + ')');
    }
  }
});

var AssetElement = AssetRenderer.extend({
  init: function (asset, baseDimension, onTouch) {
    this._super(asset, onTouch);
    
    this.type;

    // AssetElements are square, so baseDimension specifies both the base width
    // and height of this asset. AssetElements may be rendered as some multiple
    // of baseDimension depending on how special they are.
    this.baseDimension = baseDimension;

    // Being selectable is different from being selected. Selectable means this
    // element has the potential to be selected, but may or may not be. Selected
    // means this element is both selectable AND selected.
    this.isSelectable = false;
    this.isSelected = false;
    
    this.fadedEl = null;
    this.gradientEl = null;
    this.checkedEl = null;

    // The current opacity of this element.
    this.opacity = 1;

    // True when this element is selected.
    this.isSelected = false;
    
    // The starting Y position of the touch.
    this.touchStartY;
    // The ending Y position of the touch.
    this.touchEndY;

    // Called when the user touches this asset.
    this.onTouch = onTouch;
  },

  getType: function() {
    return this.type;
  },
  
  setType: function(type) {
    this.type = type;
  },

  getHeight: function() {
    if (this.type == SMALL_PICTURE) {
      return this.baseDimension;
    } else if (this.type == MEDIUM_PICTURE) {
      return this.baseDimension + this.baseDimension / 2 + PICTURE_SPACING / 2;
    } else if (this.type == LARGE_PICTURE) {
      return this.baseDimension * 2 + PICTURE_SPACING;
    } else {
      return this.baseDimension * 3 + PICTURE_SPACING * 2;
    }
  },
  
  getEl: function (dontCreate) {
    if (this.el) {
      return this.el;
    }
    if (!this.el && dontCreate) {
      return null;
    }
    
    this._super();
    
    this.el
        .css({
          height: this.getHeight() + 'px',
          opacity: this.opacity,
          width: this.getHeight() + 'px'
        })
        .on(TOUCHSTART, this.touchStart.bind(this))
        .on(TOUCHMOVE, this.touchMove.bind(this))
        .on(TOUCHEND, this.touchEnd.bind(this));

    if (this.isSelectable) {
      this.createSelectionEl();
    }

    // Optimization: Only create this DOM element when needed.
    if (this.isSelected) {
      this.createSelectionEl();
    }

    return this.el;
  },

  addAsset: function(asset) {
    this._super(asset);
    if (this.assets.length > 5) {
      this.type = EXTRA_LARGE_PICTURE;
    } else if (this.assets.length > 2) {
      this.type = LARGE_PICTURE;
    } else {
      this.type = SMALL_PICTURE;
    }
  },

  setOpacity: function(opacity) {
    if (this.el) {
      this.el.css('opacity', opacity);
    } else {
      this.opacity = opacity;
    }
  },

  /**
   * Called when the user initiates a touch.
   */
  touchStart: function (e) {
    this.touchStartY = this.touchEndY = e.originalEvent.pageY;
  },

  /**
   * Called when the user moves her finger while touching.
   */
  touchMove: function (e) {
    this.touchEndY = e.originalEvent.pageY;
  },

  /**
   * Called when the user lifts her finger.
   */
  touchEnd: function (picture) {
    // Only trigger the selection when the user has barely moved her finger.
    if (Math.abs(this.touchEndY - this.touchStartY) < 5) {
      this.onTouch();
    }
  },

  /**************************
   *
   * Selection
   *
   **************************/

  setSelectable: function(isSelectable) {
    if (this.el && isSelectable) {
      this.createSelectionEl();
    } else if (this.fadedEl) {
      this.isSelected = false;

      // Simplify the DOM once we're no longer selectable.
      this.fadedEl.remove();
      this.fadedEl = null;

      this.gradientEl.remove();
      this.gradientEl = null;
      
      this.checkedEl.remove();
      this.checkedEl = null;
    }
    this.isSelectable = isSelectable;
  },

  /**
   * Creates the selection elements if they don't already exist.
   */
  createSelectionEl: function() {
    if (this.fadedEl) {
      return;
    }
    this.fadedEl = $('<span></span>')
    		.css({
    	    background: '#ffffff',
    	    display: this.isSelected ? 'block' : 'none',
    	    height: '100%',
    	    left: 0,
    	    opacity: 0.35,
    	    position: 'absolute',
    	    top: 0,
    	    width: '100%',
    	    zIndex: 1
    		})
    		.appendTo(this.el);

    this.gradientEl = $('<img></img>')
    		.css({
    	    bottom: 0,
          height: '50px',
          left: 0,
          opacity: 0.5,
    	    position: 'absolute',
          width: '100%',
    	    zIndex: 2
    		})
    		.attr('src', Images.getPath() + 'share-gradient.png')
    		.appendTo(this.el);

    this.checkedEl = $('<img></img>')
    		.css({
    	    bottom: 5,
          opacity: this.isSelected ? 1 : 0.25,
    	    position: 'absolute',
    	    right: 5,
    	    zIndex: 3
    		})
    		.attr('src', Images.getPath() + 'check-checked-32.png')
    		.appendTo(this.el);
  },

  getSelected: function() {
    return this.isSelected;
  },

  /**
   * Sets whether this element is selected, including updating the DOM if
   * necessary.
   */
  setSelected: function (isSelected) {
    this.isSelected = isSelected;

    // Nothing to do when the DOM doesn't exist.
    if (!this.el) {
      return;
    }

    this.createSelectionEl();

    if (this.fadedEl) {
      this.fadedEl[isSelected ? 'show' : 'hide']();
      this.checkedEl.css('opacity', isSelected ? 1 : 0.25);
    }
  },

  /**
   * Toggles whether this element is selected.
   */
  toggleSelected: function () {
    this.setSelected(!this.isSelected);
  }
});

/**
 * Encapulates the logic to handle a row of asset elements.
 */
var AssetRowElement = Class.extend({
  init: function(assetElements) {
    this.el = null;
    this.assetElements = assetElements;

    // A boolean specifying whether the images have already been loaded for
    // this row.
    this.imagesLoaded = false;
    // The id for the setTimeout() that loads the images in this row.
    this.loadImagesTimerId = 0;
    // The height of this row.
    this.height = 0;
  },

  /**************************
  *
  * Functions called by VisibleElementRenderer
  *
  **************************/

  getHeight: function() {
    if (!this.height) {
      for (var i = 0, asset; asset = this.assetElements[i]; i++) {
        if (asset.getHeight() > this.height) {
          this.height = asset.getHeight();
        }
      }
      this.height += PICTURE_SPACING;
    }
    return this.height;
  },

  getVisibleElements: function() {
    return this.assetElements;
  },

  /**************************
  *
  * End functions called by VisibleElementRenderer
  *
  **************************/

  getEl: function() {
    if (this.el) {
      return this.el;
    }

    this.el = $('<div></div>')
      .css({
        height: this.getHeight() + 'px',
        position: 'relative'
      });

    var left = PICTURE_SPACING;
    var top = 0;
    // isMixed means this row contains large and small pictures.
    var isMixed = false;
    for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
      assetElement.getEl()
          .css({
            left: left + 'px',
            position: 'absolute',
            top: top + 'px'
          })
          .appendTo(this.el);
      // Not mixed mode, position horizontally.
      if (!isMixed || assetElement.getType() != SMALL_PICTURE) {
        left += assetElement.getHeight() + PICTURE_SPACING;
      // Mixed mode and it's a smallsy. Start stacking vertically.
      } else if (isMixed && assetElement.getType() == SMALL_PICTURE) {
        top += assetElement.getHeight() + PICTURE_SPACING;
      }
      isMixed |= assetElement.getType() == LARGE_PICTURE;
    }
    return this.el;
  },

  /**
  * Should be called when the asset row is shown. Loads images.
  */
  show: function() {
    this.shown = true;

    if (this.imagesLoaded || this.loadImagesTimerId) {
      return;
    }
    this.loadImagesTimerId =
        setTimeout(this.loadImages.bind(this),
            Math.random() * LOAD_IMAGES_DELAY_MS + LOAD_IMAGES_DELAY_MS);
  },

  /**
  * Should be called when the asset row is hidden.
  */
  hide: function() {
    this.shown = false;

    clearTimeout(this.loadImagesTimerId);
    this.loadImagesTimerId = 0;
  },

  /**
  * Loads the images for the assets in this row.
  */
  loadImages: function() {
    for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
      assetElement.loadImages();
    }
    this.imagesLoaded = true;
  }
});

/**
 * Encapulates a group of AssetRows. A group contains an optional header row
 * then a series of AssetRows.
 */
var AssetGroup = VisibleElementRenderer.extend({
  init: function(headerEl, assetElements, pictureDimension) {
    this.assetElements = assetElements;
    this.pictureDimension = pictureDimension;

    // AssetGroup must be initialized before the super class.
    this._super(headerEl);
  },

  /**************************
   *
   * VisibleElementRenderer overrides
   *
   **************************/

  getElements: function() {
    var elements = [];

    // Make a copy that we can modify.
    var elementsToAdd = this.assetElements.slice(0);
    var assetElementsForRow = [];
    
    while (elementsToAdd.length) {
      var element = elementsToAdd.shift();
      // Extra large assets take up an entire row so create a new row
      // immediately whenever we encounter one.
      if (element.getType() == EXTRA_LARGE_PICTURE) {
        elements.push(
            new AssetRowElement([element]));
      // Large pictures are the complicated case. In a row we can have
      // a large picture and two small ones, or two large pictures.
      } else if (element.getType() == LARGE_PICTURE) {
        assetElementsForRow.unshift(element);
        // Two assets. If both are medium, the row is finished. We only need
        // to check the first two because medium sized ones are shifted into
        // the front of the list.
        if (assetElementsForRow.length > 1 &&
              assetElementsForRow[0].getType() ==
                  assetElementsForRow[1].getType()) {
          // Add any extra small ones back into the queue.
          if (assetElementsForRow[2]) {
            elementsToAdd.unshift(assetElementsForRow[2])
            assetElementsForRow.pop();
          }
          // Special case, make the two assets medium sized.
          assetElementsForRow[0].setType(MEDIUM_PICTURE);
          assetElementsForRow[1].setType(MEDIUM_PICTURE);
          elements.push(
              new AssetRowElement(assetElementsForRow));
          assetElementsForRow = [];          
        }
      } else {
        assetElementsForRow.push(element);
      }
      
      // Finished row, or nothing left.
      if (assetElementsForRow.length == 3 || !elementsToAdd.length) {
        elements.push(
            new AssetRowElement(assetElementsForRow));
        assetElementsForRow = [];
      }
    }

    return elements;
  },

  showElement: function(isShown, assetRow) {
    assetRow[isShown ? 'show' : 'hide']();
  }
});

var ExpandedPictureViewer = Class.extend({
  init: function(assets, assetIdx) {
    this.assets = assets;
    this.assetIdx = assetIdx;

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
        Math.min(this.screenWidth - PICTURE_SPACING * 2,
            this.screenHeight - PICTURE_SPACING * 2);
    this.startLeft = (this.screenWidth - this.dimension) / 2;
    this.startTop = (this.screenHeight - this.dimension) / 2;

    this.createBackground();
    this.createExpandedAssets();
  },
  
  createBackground: function() {
    this.backgroundEl = $('<div></div>')
        .css({
          background: 'black',
          bottom: 0,
          left: 0,
          opacity: 0.75,
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: 1000
        })
        .appendTo($(document.body))
        .on(TOUCHSTART, this.hide.bind(this));
  },
  
  hide: function() {
    this.backgroundEl.remove();
    if (this.prev) {
      this.prev.getEl().remove();
    }
    if (this.next) {
      this.next.getEl().remove();
    }
    this.curr.getEl().remove();
    $(document.body)
        .off(TOUCHSTART)
        .off(TOUCHMOVE)
        .off(TOUCHEND);
  },
  
  createExpandedAsset: function(assetElement) {
    var assetRenderer = new AssetRenderer(assetElement);
    assetRenderer.getEl()
        .css({
          height: this.dimension,
          position: 'absolute',
          top: this.startTop,
          width: this.dimension,
          zIndex: 1002
        }).appendTo($(document.body));
    assetRenderer.loadImages();
    
    return assetRenderer;
  },
  
  createPreviousAsset: function() {
    this.prev = null;
    if (!this.assetIdx) {
      return;
    }
    this.prev = this.createExpandedAsset(this.assets[this.assetIdx - 1]);
    this.prev.getEl()
        .css('left', -this.dimension);
  },
  
  createNextAsset: function() {
    this.next = null;
    if (this.assetIdx >= this.assets.length) {
      return;
    }
    this.next = this.createExpandedAsset(this.assets[this.assetIdx + 1]);
    this.next.getEl()
        .css('left', this.screenWidth);    
  },
  
  createExpandedAssets: function() {
    this.createPreviousAsset();
    this.createNextAsset();

    var assetElement = this.assets[this.assetIdx];
    var offset = assetElement.getEl().offset();
    this.curr = this.createExpandedAsset(assetElement);
    this.curr.getEl()
        .css({
          height: this.dimension,
          left: this.startLeft,
          top: this.startTop,
          width: this.dimension
        });

    this.attachTouchEvents();
  },
  
  attachTouchEvents: function() {
    $(document.body)
        .on(TOUCHSTART, this.touchStart.bind(this))
        .on(TOUCHMOVE, this.touchMove.bind(this))
        .on(TOUCHEND, this.touchEnd.bind(this));
  },
  
  touchStart: function(e) {
    e.preventDefault();
    
    if (e.originalEvent.pageY < this.startTop ||
        e.originalEvent.pageY > this.startTop + this.dimension) {
      this.hide();
      return;
    }

    this.isTouching = true;
    this.touchStartX = e.originalEvent.pageX;
  },
  
  touchMove: function(e) {
    if (!this.isTouching) {
      return;
    }
    
    e.preventDefault();
    
    this.touchEndX = e.originalEvent.pageX;

    var deltaX = this.touchEndX - this.touchStartX;
    if (deltaX > 0 && !this.prev || 
        deltaX < 0 && !this.next) {
      this.touchEndX = this.touchStartX;
      return;
    }

    this.curr.getEl().css('left', this.startLeft + deltaX);
    if (this.prev) {
      this.prev.getEl().css('left', -this.dimension + deltaX);
    }
    if (this.next) {
      this.next.getEl().css('left', this.screenWidth + deltaX);
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
    this.curr.getEl().animate({
          left: destLeft,
        }, {
          complete: function() {
            if (deltaX < 0) {
              if (this.prev) {
                this.prev.getEl().remove();
              }
              this.prev = this.curr;
              this.curr = this.next;
              this.assetIdx++;
              this.createNextAsset();
            } else if (deltaX > 0) {
              if (this.next) {
                this.next.getEl().remove();
              }
              this.next = this.curr;
              this.curr = this.prev;
              this.assetIdx--;
              this.createPreviousAsset();
            }
          }.bind(this),
          duration: 100,
          step: function(now, tween) {
            var t = (tween.now - tween.start) / (tween.end - tween.start);
            if (deltaX < 0) {
              var distanceRemaining = ((this.screenWidth + deltaX) -
                  this.startLeft);
              this.next.getEl().css('left', this.screenWidth + deltaX -
                  distanceRemaining * t);
            } else if (deltaX > 0) {
              var distanceRemaining = ((-this.dimension + deltaX) -
                  this.startLeft);
              this.prev.getEl().css('left', -this.dimension + deltaX -
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

/**
 * Encapulates the logic for a picture selector based around the camera roll.
 */
var AddPictures = VisibleElementRenderer.extend({
  init: function(width, scroller, useFancyPants) {
    // The width of the parent element.
    this.width = width;
    // If true, combines assets into fancy pants animated elements.
    this.useFancyPants = useFancyPants;
    // The list of all AssetElements.
    this.assetElements = [];
    // The list of all AssetElements per group.
    this.assetElementsPerGroup = [];

    // If true, the asset elements become selectable.
    this.isSelectable = false;
    // If true, shows the Select all/select none toggle.
    this.showSelectAll = false;
    // The callback for when the selection changes.
    this.selectionChangedCallback = null;
    // The number of asset elements that are selected.
    this.numSelected = 0;
    // The element that contains the select all/select none link.
    this.selectAllEl = null;

    // The dimension of an individual picture. This corresponds to the
    // width and height since pictures are square.
    this.pictureDimension = (this.width - (PICTURE_SPACING * 2) -
        PICTURE_SPACING * (3 - 1)) / 3;
    // The height of an individual row is equal to the height of a picture
    // plus the interrow spacing.
    this.rowHeight = this.pictureDimension + PICTURE_SPACING;

    // The scroller object that encompasses this set of pictures.
    this.scroller = scroller;
    this.scroller.scroll(this.updateVisibleElements.bind(this));

    // AddPictures must be initialized before the super class.
    this._super();
  },

  /**************************
   *
   * OVERRIDE THESE FUNCTIONS!!!
   *
   **************************/

  /**
   * Returns the number of groups that should be rendered.
   */
  getNumGroups: function() {
    throw 'AddPictures must be subclassed. ' +
        'getNumGroups must be implemented.';
  },

  /**
   * Returns a list of assets for the specified group.
   */
  getAssetsForGroup: function(groupIndex) {
    throw 'AddPictures must be subclassed. ' +
        'getAssetsForGroup must be implemented.';
  },

  /**
   * Returns the element to be used as the header for the specified group.
   */
  getGroupHeaderEl: function(groupIndex) {
    return null;
  },

  /**************************
   *
   * VisibleElementRenderer overrides
   *
   **************************/

  getElements: function() {
    var elements = [];
    for (var i = 0; i < this.getNumGroups(); i++) {
      var assetElementsForGroup =
          this.assetElementsFromAssets(this.getAssetsForGroup(i),
              this.useFancyPants);
      elements.push(
          new AssetGroup(this.getGroupHeaderEl(i), assetElementsForGroup,
              this.pictureDimension));
      this.assetElements = this.assetElements.concat(assetElementsForGroup);
      this.assetElementsPerGroup[i] = assetElementsForGroup.slice();
    }
    return elements;
  },

  /**
   * Creates and returns the picture selector element. Only adds pictures that
   * are not currently added to the personal library.
   */
  getEl: function() {
    this._super();

    this.selectAllContainerEl = $('<div></div>')
  			.css({
            display: this.showSelectAll ? 'block' : 'none',
  			    marginBottom: '10px',
            marginRight: PICTURE_SPACING + 'px',
  			    textAlign: 'right'
  			})
  			.prependTo(this.el);
    this.selectAllEl = $('<span></span>')
  			.css({
  			    color: 'blue',
  			    cursor: 'pointer'
  			})
  			.text('Select all')
  			.on(TOUCHEND, this.toggleSelectAll.bind(this))
  			.appendTo(this.selectAllContainerEl);

    this.updateVisibleElements();
    
    if (this.useFancyPants) {
      setInterval(this.onStepAnimation.bind(this), 250);
    }

    return this.el;
  },
  
  updateVisibleElements: function() {
    var scrollPosition = this.scroller.getScrollPosition();
    // Use the aboveEl to calculate the top of the picture viewer in case the
    // select all/select none element is visible.
    var scrollTop = scrollPosition.y -
        (this.aboveEl.offset().top - this.scroller.getEl().offset().top);
    this._super(scrollTop, this.scroller.getContainerHeight());
  },
  
  /**************************
   *
   * End VisibleElementRenderer overrides
   *
   **************************/

  /**
   * Returns a list of AssetElements from a list of Assets. May combine many
   * Assets into a single AssetElement if useFancyPants is set to true.
   */
  assetElementsFromAssets: function(assets, useFancyPants) {
    var lastAsset = null;

    var assetElements = [];
    for (var i = 0, asset; asset = assets[i]; i++) {
      // Combine assets that are within
      if (useFancyPants && lastAsset &&
          asset.timestamp - lastAsset.timestamp < FANCY_PANTS_TIME_DELTA_SEC) {
        assetElements[assetElements.length - 1].addAsset(asset);
      } else {
        assetElements.push(
            new AssetElement(asset, this.pictureDimension,
                this.onTouchAssetElement.bind(this,
                    this.assetElements.length + assetElements.length)));
      }
      lastAsset = asset;
    }

    return assetElements;
  },

  /**
   * Returns the number of pictures being displayed.
   */
  getNumPictures: function () {
    return this.assetElements.length;
  },

  /**
   * Called when the user touches an AssetElement.
   */
  onTouchAssetElement: function(assetElementIdx) {
    if (this.isSelectable) {
      var assetElement = this.assetElements[assetElementIdx];
      assetElement.toggleSelected();
      this.onSelectionChanged(assetElement, assetElement.getSelected())
    } else {
      this.pictureViewer =
          new ExpandedPictureViewer(this.assetElements, assetElementIdx);
    }
  },

  /**************************
   *
   * Selection
   *
   **************************/

  /**
   * Enables/disables selection.
   */
  setSelectable: function (isSelectable, showSelectAll, selectionChangedCallback) {
    if (isSelectable != this.isSelectable) {
      for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
        assetElement.setSelectable(isSelectable);
      }
    }

    this.isSelectable = isSelectable;

    this.showSelectAll = showSelectAll;
    if (this.selectAllContainerEl) {
      this.selectAllContainerEl.css('display',
          showSelectAll ? 'block' : 'none');
    }

    this.selectionChangedCallback = selectionChangedCallback;
  },
  
  /**
   * Called when the user taps one of the asset elements.
   */
  onSelectionChanged: function(isSelected) {
    this.numSelected += isSelected ? 1 : -1;
    if (this.selectionChangedCallback) {
      this.selectionChangedCallback(this.numSelected);
    }
    this.setSelectAllText(this.numSelected != this.assetElements.length);
  },

  /**
   * Returns an array containing all the pictures that are currently
   * selected.
   */
  getSelected: function () {
    var selectedAssetElements = this.getSelectedElements();

    var selected = [];
    for (var i = 0, assetElement; assetElement = selectedAssetElements[i];
        i++) {
      selected = selected.concat(assetElement.getAssets());
    }
    return selected;
  },

  /**
   * Returns an array containing all the AssetElements that are currently
   * selected.
   */
  getSelectedElements: function () {
    var selectedElements = [];
    for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
      if (assetElement.isSelected) {
        selectedElements.push(assetElement);
      }
    }
    return selectedElements;
  },

  /**
   * Sets the text on the Select all/Select none link.
   */
  setSelectAllText: function (isSelectAll) {
    this.selectAllEl.text(isSelectAll ? 'Select all' : 'Select none');
  },

  /**
   * Sets the select status of all pictures.
   */
  setSelectStatus: function(selectAll) {
    for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
      assetElement.setSelected(selectAll);
    }
    this.setSelectAllText(!selectAll);
    this.numSelected = selectAll ? this.assetElements.length : 0;

    if (this.selectionChangedCallback) {
      this.selectionChangedCallback(this.numSelected);
    }    
  },

  /**
   * Toggles the selected status of the images. When:
   *   All are already selected: Unselects all of them.
   *   Some are unselected: Selects all of them.
   */
  toggleSelectAll: function (e) {
    this.setSelectStatus(this.numSelected != this.assetElements.length);
  },
  
  /**
   * Selects all items in a specific group.
   */
  toggleSelectGroup: function(groupIndex) {
    var assetElements = this.assetElementsPerGroup[groupIndex];
    // First pass, check if any are unselected. If so, select them.
    var allSelected = true;
    for (var i = 0, assetElement; assetElement = assetElements[i]; i++) {
      if (!assetElement.getSelected()) {
        this.numSelected++;
        assetElement.setSelected(true);
        allSelected = false;
      }
    }
    
    // First pass found that they are all selected. Unselect them.
    if (allSelected) {
      for (var i = 0, assetElement; assetElement = assetElements[i]; i++) {
        assetElement.setSelected(false);
      }
      this.numSelected -= assetElements.length;
    }
    
    if (this.selectionChangedCallback) {
      this.selectionChangedCallback(this.numSelected);
    }    
  },

  /**
   * Removes all the selected pictures.
   */
  removeSelected: function(callback) {
    var selectedAssetElements = this.getSelectedElements();

    // Create a temporare element to use for animations. We just want access to the
    // step function.
    var elementToAnimate = $('<span></span>');
    elementToAnimate.animate({
      opacity: 0
    }, {
      duration: 500,
      easing: 'swing',
      step: function(now) {
        for (var i = 0, assetElement; assetElement = selectedAssetElements[i];
            i++) {
          assetElement.setOpacity(now);
        }
      },
      complete: function () {
        for (var i = this.assetElements.length - 1; i >= 0; i--) {
          var assetElement = this.assetElements[i];
          if (assetElement.isSelected) {
            var el = assetElement.getEl(true);
            if (el) {
              el.remove();
            }
            this.assetElements.splice(i, 1);
          }
        }

        // TODO: Removing elements doesn't work.

        callback();
      }.bind(this)
    });
  },

  /**
   * Animate the pictures
   */
  onStepAnimation: function() {
    var visibleElements = this.getVisibleElements();
    for (var i = 0, assetElement;
                assetElement = this.visibleElements[i]; i++) {
      assetElement.stepAnimation();
    }
    if (this.pictureViewer) {
      this.pictureViewer.stepAnimation();
    }
  }
});
