var NUM_COLUMNS = 3;
var PICTURE_SPACING = 2;
var USE_VARIOUS_SPACING_UI = false;
// Assets with timestamps smaller than this will be combined into a single
// asset element when using fancy pants rendering.
var FANCY_PANTS_TIME_DELTA_SEC = 15;

var VisibleElementRenderer = Class.extend({
  init: function() {
    this.el = null;
    this.tops = [];
    this.height = 0;
    this.elements = this.getElements();
  },
  
  /**************************
   *
   * OVERRIDE THESE FUNCTIONS!!!
   *
   **************************/

  getElements: function() {
    throw 'VisibleElementRendered must be subclassed. ' +
        'getElements must be implemented.';
  },

  showElement: function(shown, element) {
    // Implementation of this function is optional.
  },

  /**************************
   *
   * END OVERRIDE
   *
   **************************/
  
  getHeight: function() {
    if (!this.height) {
      this.height = 0;
      for (var i = 0, element; element = this.elements[i]; i++) {
        this.height += element.getHeight();
      }
    }
    return this.height;
  },
  
  getEl: function() {
    if (this.el) {
      return this.el;
    }

    this.el = $('<div></div>')
        .css('height', this.getHeight() + 'px');
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
    
    this.height = top;
    
    return this.el;
  },

  /**
   * Determines which elements are currently within the viewport.
   */
  determineVisibleElements: function(viewportTop, viewportHeight) {
    // A negative viewportTop means the picture selector is further down on the
    // page, perhaps all the way off the screen.
    if (viewportTop < 0 && viewportTop < -viewportHeight) {
      // Not visible.
      return null;
    }
    
    // Do a binary search to find which elements are visible.
    var low = 0;
    var high = this.elements.length - 1;
    while (low != high) {
      var mid = Math.floor((low + high) / 2);
      
      if (!this.elements[mid]) {
        debugger;
      }
      
      // This group is below the viewport.
      var top = this.tops[mid];
      if (top + this.elements[mid].getHeight() < viewportTop) {
        low = mid + 1;
      // This element is at least above the viewport, so use it as the
      // new high.
      } else {
        high = mid;
      }
    }

    var firstIndex = low;
    var lastIndex = low;
    var viewportBottom = viewportTop + viewportHeight;
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

  /**
   * Determines which elements are now hidden and removes them from the DOM.
   */
  clearHiddenElements: function(visibleElements) {
    for (var i = this.visibleElements.firstIndex;
        i < this.visibleElements.lastIndex; i++) {
      if (i < visibleElements.firstIndex || i >= visibleElements.lastIndex) {
        this.showElement(false, this.elements[i]);
        this.elements[i].getEl().detach();
      }
    }
  },
  
  /**
   * Inserts the visible elements into the DOM.
   */
  insertVisibleElements: function(visibleElements) {
    var insertAfter = null;
    for (var i = visibleElements.firstIndex; i <= visibleElements.lastIndex;
        i++) {
      var element = this.elements[i];
      var elementEl = element.getEl();
      // A row that already has a parent is already in the DOM so we can safely
      // skip it.
      if (!elementEl.parent().length) {
        // First row wont have a previous sibling, so place at the front.
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
   * This optimization works by only showing those rows in the DOM that are
   * currently within the viewport. There are three divs in the following DOM
   * order:
   *
   * - aboveEl
   * - visibleEl
   * - belowEl
   *
   * The visibleEl element is the only one that contains content. The other two
   * elements are used to pad the height of the content div to keep the scroll
   * height the same.
   *
   * Each time the page moves, we calculate the current viewport, show/hide rows
   * as necessary, and update the height of the various viewport sections.
   *
   * In addition, this allows us to only create DOM elements and load images as they
   * come into view, thereby speeding up the initial rendering immensely.
   */
  updateVisibleElements: function(viewportTop, viewportHeight) {
    var visibleElements =
        this.determineVisibleElements(viewportTop, viewportHeight);

    if (this.visibleElements) {
      this.clearHiddenElements(visibleElements);
    }

    this.aboveEl.css('height', this.tops[visibleElements.firstIndex] + 'px');
    this.belowEl.css('height',
        this.height - (this.tops[visibleElements.lastIndex] +
            this.elements[visibleElements.lastIndex].getHeight()) + 'px');

    if (!this.visibleElements ||
        visibleElements.firstIndex != this.visibleElements.firstIndex ||
        visibleElements.lastIndex != this.visibleElements.lastIndex) {
      this.insertVisibleElements(visibleElements);    
      this.visibleElements = visibleElements;
    }

    for (var i = visibleElements.firstIndex; i <= visibleElements.lastIndex;
        i++) {
      var element = this.elements[i];  
      if (!('updateVisibleElements' in element)) {
        break;
      }
      element.updateVisibleElements(
          viewportTop - this.tops[i], viewportHeight);
    }
  }
});

var AssetElement = Class.extend({
  init: function (addPictures, asset, baseDimension) {
    // We need access to the AddPicture object to check if selections
    // are enabled, and to fire the onSelectionChanged callback when the 
    // selections change.
    this.addPictures = addPictures;

    this.assets = [];
    this.addAsset(asset);
    
    // AssetElements are square, so baseDimension specifies both the base width
    // and height of this asset. AssetElements may be rendered as some multiple
    // of baseDimension depending on how special they are.
    this.baseDimension = baseDimension;
    
    this.nextAsset = 1;

    this.el = null;
    this.imageEl = null;
    this.nextImageEl = null;
    this.fadedEl = null;
    this.checkedEl = null;
    this.offset = null;
    
    // The current opacity of this element.
    this.opacity = 1;

    // True when this element is selected.
    this.isSelected = false;
    // The starting Y position of the touch.
    this.touchStartY;
    // The ending Y position of the touch.
    this.touchEndY;
    
    // True when the images have been loaded for this asset.
    this.imagesLoaded = false;       
  },
  
  getHeight: function() {
    return this.baseDimension;
  },
  
  getEl: function (dontCreate) {
    if (this.el) {
      return this.el;
    }
    if (!this.el && dontCreate) {
      return null;
    }
    
    this.el = $('<span></span>')
        .css({
            display: 'inline-block',
            height: this.baseDimension + 'px',
            marginLeft: PICTURE_SPACING + 'px',
            opacity: this.opacity,
            position: 'relative',
            width: this.baseDimension + 'px'
        });

    this.imageEl = this.getImageEl()
          .appendTo(this.el);
    if (this.assets.length > 1) {
      this.nextImageEl = this.getImageEl()
          .css('opacity', 0)
          .appendTo(this.el);
    }
    
    // Optimization: Only create this DOM element when needed.
    if (this.isSelected) {
      this.createSelectionEl();
    }

    this.el.on(TOUCHSTART, this.touchStart.bind(this));
    this.el.on(TOUCHMOVE, this.touchMove.bind(this));
    this.el.on(TOUCHEND, this.touchEnd.bind(this));

    return this.el;
  },

  getImageEl: function() {
    return $('<span></span>')
        .css({
          background: '#eee',
          backgroundSize: 'cover',
          display: 'inline-block',
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%'
        });
  },
  
  getOffset: function() {
      if (!this.offset) {
          this.offset = this.el.offset();
      }
      return this.offset;
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
      if (this.assets.lenth < 2)
          return;

      this.nextAsset = (this.nextAsset + 1) % this.assets.length;

      this.nextImageEl.animate({
          opacity: 1
      }, 1000, function() {
          this.imageEl.remove();
          this.imageEl = this.nextImageEl;
          this.nextImageEl = this.getImageEl(this.assets[this.nextAsset].getSrc())
              .css('opacity', 0)
              .appendTo(this.el);            
      }.bind(this))
  },
  
  setOpacity: function(opacity) {
    if (this.el) {
      this.el.css('opacity', opacity);
    } else {
      this.opacity = opacity;
    }
  },
  
  /**************************
   *
   * Selection
   *
   **************************/

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
	    display: this.isSelected ? 'block' : none,
	    height: '100%',
	    left: 0,
	    opacity: 0.35,
	    position: 'absolute',
	    top: 0,
	    width: '100%',
	    zIndex: 1
		})
		.appendTo(this.el);

    this.checkedEl = $('<img></img>')
		.css({
	    bottom: 5,
	    display: this.isSelected ? 'block' : none,
	    position: 'absolute',
	    right: 5,
	    zIndex: 2
		})
		.attr('src', Images.getPath() + 'check.png')
		.appendTo(this.el);
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
    if (Math.abs(this.touchEndY - this.touchStartY) < 5 &&
        this.addPictures.isSelectable) {
      this.toggleSelected();
      this.addPictures.onSelectionChanged(this.isSelected)
    }
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

    if (isSelected) {
      this.createSelectionEl();
    }

    if (this.fadedEl) {
      this.fadedEl[isSelected ? 'show' : 'hide']();
      this.checkedEl[isSelected ? 'show' : 'hide']();
    }
  },

  /**
   * Toggles whether this element is selected.
   */
  toggleSelected: function () {
    this.setSelected(!this.isSelected);
  },
  
  loadImages: function() {
    this.imageEl.css('background-image', 'url(' + this.assets[0].getSrc() + ')');
  }
});

/**
 * Encapulates the logic to handle a row of asset elements.
 */
var AssetRowElement = Class.extend({
   init: function(assetElements) {
     this.el = null;
     this.assetElements = assetElements;
     
     // A boolean specifying whether the images have already been loaded for this
     // row.
     this.imagesLoaded = false;
     // The id for the setTimeout() that loads the images in this row.
     this.loadImagesTimerId = 0;
     // The height of this row.
     this.height = 0;
   },
   
   getHeight: function() {
     if (!this.height) {
       for (var i = 0, asset; asset = this.assetElements[i]; i++) {
         if (asset.getHeight() > this.height) {
           this.height = asset.getHeight();
         }
       }
     }
     return this.height;
   },
      
   getEl: function() {
     if (this.el) {
       return this.el;
     }

     this.el = $('<div></div>')
         .css('margin-bottom', PICTURE_SPACING + 'px');
     for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
       assetElement.getEl().appendTo(this.el);
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
         setTimeout(this.loadImages.bind(this), Math.random() * 250 + 250);
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
     for (var i = 0, assetElement;
         assetElement = this.assetElements[i]; i++) {
       assetElement.loadImages();
     }
     this.imagesLoaded = true;     
   }
});

/**
 * Encapulates a group of assets. A group contains an optional header row,
 * the grid of assets, then an optional footer row.
 */
var AssetGroup = VisibleElementRenderer.extend({
  init: function(assetElements, pictureDimension) {
    this.assetElements = assetElements;
    this.pictureDimension = pictureDimension;

    // AssetGroup must be initialized before the super class.
    this._super();
  },
  
  /**************************
   *
   * VisibleElementRenderer overrides
   *
   **************************/
  
  getElements: function() {
    var elements = [];

    // The DOM for the various asset rows will be created dynamically, so
    // we need to set a fixed height now.
    var numRows = Math.ceil(this.assetElements.length / NUM_COLUMNS);
    var numElements = this.assetElements.length;
    for (var i = 0; i < numElements; i += 3) {
      var assetElementsForRow = [];
      for (var j = i; j < numElements && j < i + 3; j++) {
        assetElementsForRow.push(this.assetElements[j]);
      }
      elements.push(
          new AssetRowElement(assetElementsForRow));
    }
    
    return elements;
  },
  
  showElement: function(isShown, assetRow) {
    assetRow[isShown ? 'show' : 'hide']();
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
        PICTURE_SPACING * (NUM_COLUMNS - 1)) /
        NUM_COLUMNS;
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
        new AssetGroup(assetElementsForGroup, this.pictureDimension));
      this.assetElements = this.assetElements.concat(assetElementsForGroup);
    }
    return elements;
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

  /**************************
   *
   * Initialization
   *
   **************************/

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

    return this.el;
  },

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
            new AssetElement(this, asset, this.pictureDimension));
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

  /**************************
   *
   * Selection
   *
   **************************/

  /**
   * Enables/disables selection.
   */
  setSelectable: function (isSelectable, showSelectAll, selectionChangedCallback) {
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
   * Toggles the selected status of the images. When:
   *   All are already selected: Unselects all of them.
   *   Some are unselected: Selects all of them.
   */
  toggleSelectAll: function (e) {
    var shouldSelectAll = this.numSelected != this.assetElements.length;
    for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
      assetElement.setSelected(shouldSelectAll);
    }
    this.setSelectAllText(!shouldSelectAll);
    this.numSelected = shouldSelectAll ? this.assetElements.length : 0;

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

  updateVisibleElements: function() {
    var scrollPosition = this.scroller.getScrollPosition();
    // Use the aboveEl to calculate the top of the picture viewer in case the
    // select all/select none element is visible.
    var scrollTop = scrollPosition.y -
        (this.aboveEl.offset().top - this.scroller.getEl().offset().top);
    this._super(scrollTop, this.scroller.getContainerHeight());
  },

  /**
   * Animate the pictures
   */
  onStepAnimation: function() {
      var top = $(document).scrollTop();
      var height = $(window).height();

      for (var i = 0, assetElement;
                  assetElement = this.animatedAssetElements[i]; i++) {
          var offset = assetElement.getOffset();
          if (offset.top + assetElement.el.height() > top && offset.top < top + height) {
              assetElement.stepAnimation();
          }
      }
  }
});
