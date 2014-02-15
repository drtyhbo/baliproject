var NUM_COLUMNS = 3;
var PICTURE_SPACING = 2;
var USE_VARIOUS_SPACING_UI = false;
// Assets with timestamps smaller than this will be combined into a single
// asset element when using fancy pants rendering.
var FANCY_PANTS_TIME_DELTA_SEC = 15;

var VisibleElementSelector = Class.extend({
  init: function() {
    this.el = null;
    this.elements = [];
    this.tops = [];
    this.height = 0;
  },
  
  getEl: function() {
    this.el = $('<div></div>');
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
    var high = this.elements.length;
    while (low != high) {
      var mid = Math.floor((low + high) / 2);
      
      // This group is below the viewport.
      var top = this.tops[mid];
      if (tops + this.elements[mid].getHeight() < viewportTop) {
        low = mid + 1;
      // This element is at least above the viewport, so use it as the
      // new high.
      } else {
        high = mid;
      }
    }

    var firstIndex = low;
    var lastIndex;
    var viewportBottom = viewportTop + viewportHeight;
    for (var i = firstIndex + 1, element; element = this.elements[i]; i++) {
      if (this.tops[i] + this.elements[i].getHeight() < viewportBottom) {
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
    for (var i = this.visibleElements.firstGroupIndex;
        i < this.visibleElements.lastGroupIndex; i++) {
      if (i < visibleElements.firstGroupIndex || i >= visibleElements.lastGroupIndex) {
        this.groups[i].getEl().detach();
      }
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
        this.height - this.tops[visibleElements.lastRowIndex] + 'px');

    if (!this.visibleGroups ||
        visibleGroups.firstRowIndex != this.visibleGroups.firstRowIndex ||
        visibleGroups.lastRowIndex != this.visibleGroups.lastRowIndex) {
      // The clearHiddenRows call above may have trimmed some of the rows, but not
      // all of them. Therefore, we may need to insert some rows at the beginning of
      // the viewport, and some rows at the end.
      var insertAfter = null;
      for (var i = viewport.firstRowIndex; i < viewport.lastRowIndex; i++) {
        var assetRowEl = this.assetRows[i].getEl();
        // A row that already has a parent is already in the DOM so we can safely
        // skip it.
        if (!assetRowEl.parent().length) {
          // First row wont have a previous sibling, so place at the front.
          if (!insertAfter) {
            this.viewportEl.prepend(assetRowEl);
          } else {
            assetRowEl.insertAfter(insertAfter);
          }
          this.assetRows[i].show();
        }
        insertAfter = assetRowEl;
      }
    
      this.currentViewport = viewport;
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
    * Selects all the asset elements if isSelected is true. Unselects all
    * elements otherwise.
    */
   selectAll: function(isSelected) {
     for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
       assetElement.setSelected(isSelected)
     }
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
var AssetGroup = Class.extend({
  init: function(assetElements, pictureDimension) {
    this.pictureDimension = pictureDimension;
    this.assetElements = assetElements;

    this.visibleRows = null;
    // Contains all the rows that are above the visible content.
    this.aboveEl = null;
    // Contains all the rows that are visible.
    this.visibleEl = null;
    // Contains all the rows that are below the visible content.
    this.belowViewportEl = null;

    this.assetRows = [];

    // The total height of this section.
    this.height;
  },
  
  getHeight: function() {
    return this.height;
  },
  
  layout: function() {
    // The DOM for the various asset rows will be created dynamically, so
    // we need to set a fixed height now.
    var numRows = Math.ceil(this.assetElements.length / NUM_COLUMNS);
    var numElements = this.assetElements.length;
    for (var i = 0; i < numElements; i += 3) {
      var assetElementsForRow = [];
      for (var j = i; j < numElements && j < i + 3; j++) {
        assetElementsForRow.push(this.assetElements[j]);
      }
      this.assetRows.push(
          new AssetRowElement(this, assetElementsForRow));
    }
    
    this.rowHeight = this.pictureDimension + PICTURE_SPACING;
    this.height = numRows * (this.pictureDimension + PICTURE_SPACING);
  },

  /**
   * Determines which rows are currently within the viewport.
   */
  determineVisibleRows: function(scrollTop, viewportHeight) {
    if (scrollTop < 0) {
      var firstRowIndex = 0;
    } else {
      var firstRowIndex = Math.floor(scrollTop / this.rowHeight);
    }
    var lastRowIndex = Math.ceil((scrollTop + viewportHeight) / this.rowHeight);

    return {
      firstRowIndex: firstRowIndex,
      lastRowIndex: lastRowIndex
    };
  },

  /**
   * Determines which rows are now hidden and removes them from the DOM.
   */
  clearHiddenRows: function(viewport) {
    for (var i = this.visibleRows.firstRowIndex;
        i < this.visibleRows.lastRowIndex; i++) {
      if (i < visibleRows.firstRowIndex || i >= visibleRows.lastRowIndex) {
        this.assetRows[i].getEl().detach();
        this.assetRows[i].hide();
      }
    }
  },

  updateVisibleElements: function(scrollTop, viewportHeight) {
    var visibleRows = this.determineVisibleRows(scrollTop, viewportHeight);

    if (this.visibleRows) {
      this.clearHiddenRows(visibleRows);
    }

    this.aboveEl.css('height', visibleRows.firstRowIndex * this.rowHeight + 'px');
    this.visibleEl.css('height',
        (visibleRows.lastRowIndex - visibleRows.firstRowIndex) * this.rowHeight + 'px');
    this.belowEl.css('height',
        (this.assetRows.length - visibleRows.lastRowIndex) * this.rowHeight + 'px');

    if (!this.visibleRows ||
        visibleRows.firstRowIndex != this.visibleRows.firstRowIndex ||
        visibleRows.lastRowIndex != this.visibleRows.lastRowIndex) {
      // The clearHiddenRows call above may have trimmed some of the rows, but not
      // all of them. Therefore, we may need to insert some rows at the beginning of
      // the viewport, and some rows at the end.
      var insertAfter = null;
      for (var i = visibleRows.firstRowIndex;
          i < visibleRows.lastRowIndex; i++) {
        var assetRowEl = this.assetRows[i].getEl();
        // A row that already has a parent is already in the DOM so we can safely
        // skip it.
        if (!assetRowEl.parent().length) {
          // First row wont have a previous sibling, so place at the front.
          if (!insertAfter) {
            this.visibleEl.prepend(assetRowEl);
          } else {
            assetRowEl.insertAfter(insertAfter);
          }
          this.assetRows[i].show();
        }
        insertAfter = assetRowEl;
      }
    
      this.visibleRows = visibleRows;
    }
  }
});

/**
 * Encapulates the logic for a picture selector based around the camera roll.
 */
var AddPictures = VisibleElementSelector.extend({
  /**
   * props - The list of configuration properties.
   *   width - The width of the parent element.
   *   scroller - The scroller object that encompasses this set of pictures.
   *   useFancyPants - If true, combines assets into fancy pants animated elements,
   *       and uses fancy pants, different size, rendering.
   */
  init: function(width, scroller, useFancyPants) {
    this._super();

    // This block contains all the content which is above the visible content.
    this.aboveEl = null;
    // This block contains all the content which is currently visible.
    this.visibleEl = null;
    // This block contains all the content which is below the visible content.
    this.belowEl = null;

    this.visibleGroups = null;

    this.width = width;

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

    for (var i = 0; i < this.getNumGroups(); i++) {
      var assetElementsForGroup =
          this.assetElementsFromAssets(this.getAssetsForGroup(i),
              useFancyPants);
      this.elements.push(
        new AssetGroup(assetElementsForGroup, this.pictureDimension));
    }
    
    this.scroller = scroller;
    this.scroller.scroll(this.updateVisibleGroups.bind(this));
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
      //top level div
      this.el = $('<div></div>');

      this.selectAllContainerEl = $('<div></div>')
    			.css({
              display: this.showSelectAll ? 'block' : 'none',
    			    marginBottom: '10px',
              marginRight: PICTURE_SPACING + 'px',
    			    textAlign: 'right'
    			})
    			.appendTo(this.el);
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
   * Render pictures in an animated view
   */
  renderVariousSpacingUi: function() {
      this.animatedAssetElements = [];


      var bigImageCount = 0;
      var numRows = Math.ceil(this.assetElements.length / 3);
      for (var row = 0; row < numRows; row++) {
          var start = row * 3;
          var isLastRow = false;

          var numFrames = 0;
          var bigImageIndex = -1;
          // Only make an asset large if the row is full.
          if (this.assetElements.length - start > 2) {
              // Determine if any of the assets are animated and thus should
              // be displayed large.
              for (var i = start, assetElement; i < start + 3; i++) {
                  assetElement = this.assetElements[i];
                  if (!assetElement) {
                      break;
                  }
                  //select asset with biggest number of frames to be large image
                  if (assetElement.getNumFrames() > 2) {
                      if (assetElement.getNumFrames() > numFrames) {
                          bigImageIndex = i;
                          numFrames = assetElement.getNumFrames();
                      }
                  }
              }
          }
          
          var currentRow = $('<div></div>')
                  .css({
                      height:
                          bigImageIndex != -1 ?
                                  this.pictureDimension * 2 + PICTURE_SPACING + 'px':
                                  this.pictureDimension + 'px',
                      marginBottom: isLastRow ? 0 : PICTURE_SPACING + 'px',
                      position: 'relative'
                  })
                  .appendTo(this.el);
          
          // Layout the row where one of the images is large.
          if (bigImageIndex != -1) {
              var isLeftAligned = bigImageCount++ % 2 == 0;
              var bigImageDimension = this.pictureDimension * 2 + PICTURE_SPACING;

              // Layout the big mama jama first.
              this.assetElements[bigImageIndex].getEl()
                  .css({
                      height: bigImageDimension + 'px',
                      left: isLeftAligned ?
                              0 : this.pictureDimension + PICTURE_SPACING + 'px',
                      position: 'absolute',
                      top: 0,
      		        width: bigImageDimension + 'px'
      		    })
                  .appendTo(currentRow);

              for (var i = start, top = 0, assetElement; i < start + 3; i++) {
                  if (i == bigImageIndex) {
                      continue;
                  }
                  assetElement = this.assetElements[i];
                  if (!assetElement) {
                      break;
                  }
                  assetElement.getEl()
                      .css({
                          height: this.pictureDimension + 'px',
                          left: isLeftAligned ?
                                  bigImageDimension + PICTURE_SPACING + 'px' :
                                  0,
                          position: 'absolute',
                          top: top,
          		        width: this.pictureDimension + 'px'
          		    })
                      .appendTo(currentRow);
                  top += this.pictureDimension + PICTURE_SPACING;  
              }
          // Layout the row where all the images are small.
          } else {
              for (var i = start, assetElement; i < start + 3; i++) {
                  assetElement = this.assetElements[i];
                  if (!assetElement) {
                      break;
                  }
                  var thumbnailEl = assetElement.getEl()
                      .css({
                          left: (i % NUM_COLUMNS) * (this.pictureDimension + PICTURE_SPACING) + 'px',
                          height: this.pictureDimension + 'px',
                          position: 'absolute',
                          top: 0,
          		        width: this.pictureDimension + 'px'
          		    }) 
                      .appendTo(currentRow);

              }
          }
      }
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
    for (var i = 0, assetRow; assetRow = this.assetRows[i]; i++) {
      assetRow.selectAll(shouldSelectAll);
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

        // We could try to be super fancy and recalculate which assets belong
        // in which rows, but that seems way to complicated. Easier to remove
        // all the rows and start from scratch. We can always revisit if this
        // becomes a performance issue.
        this.viewportEl.empty();
        this.assetRows = [];
        this.renderStandardUi();
        
        this.currentViewport = null;
        this.scroller.updateHeight();
        
        callback();
      }.bind(this)
    });
  },

  /**************************
   *
   * Scrolling optimizations
   *
   **************************/

  /**
   * Determines which groups are currently within the viewport.
   */
  determineVisibleGroups: function(scrollPosition, viewportHeight) {
    // The picture selector might not be flush with the top of the scrollable content,
    // so calculate the scroll top as if the picture selector were at the top. We
    // use the aboveViewportEl as the top because the Select all toggle might be
    // visible.
    var relativeScrollTop = scrollPosition.y -
        (this.aboveViewportEl.offset().top -
            this.scroller.getEl().offset().top);

    // A negative relativeScrollTop means the picture selector is further down on the
    // page, perhaps all the way off the screen.
    if (relativeScrollTop < 0 && relativeScrollTop < -viewportHeight) {
      // Not visible.
      return null;
    }
    
    // Do a binary search to find which group is visible.
    var low = 0;
    var high = this.groups.length;
    while (low != high) {
      var mid = Math.floor((low + high) / 2);
      
      // This group is below the viewport.
      var groupTop = this.groupTops[mid];
      if (groupTop + this.groups[mid].height < relativeScrollTop) {
        low = mid + 1;
      // This group is at least above the viewport, so use it as the
      // new high.
      } else {
        high = mid;
      }
    }

    var firstGroupIndex = low;
    var lastGroupIndex;
    for (var i = firstGroupIndex + 1, group; group = this.groups[i]; i++) {
      if (this.groupTops[i] + this.group[i].getHeight() <
          relativeScrollTop + viewportHeight) {
        lastGroupIndex = i;
      }
    }
    
    return {
      firstGroupIndex: firstGroupIndex,
      lastGroupIndex: lastGroupIndex
    }
  },

  /**
   * Determines which groups are now hidden and removes them from the DOM.
   */
  clearHiddenGroups: function(visibleGroups) {
    for (var i = this.visibleGroups.firstGroupIndex;
        i < this.visibleGroups.lastGroupIndex; i++) {
      if (i < visibleGroups.firstGroupIndex || i >= visibleGroups.lastGroupIndex) {
        this.groups[i].getEl().detach();
      }
    }
  },
  
  updateVisibleGroups: function() {
    var visibleGroups =
        this.determineVisibleGroups(this.scroller.getScrollPosition(),
            this.scroller.getContainerHeight());

    if (this.visibleGroups) {
      this.clearHiddenGroups(visibleGroups);
    }

    this.aboveEl.css('height',
        visibleGroups.firstRowIndex * this.rowHeight + 'px');
    this.visibleGroupsEl.css('height',
        (visibleGroups.lastRowIndex - visibleGroups.firstRowIndex) * this.rowHeight + 'px');
    this.belowViewportEl.css('height',
        (this.assetRows.length - visibleGroups.lastRowIndex) * this.rowHeight + 'px');

    if (!this.visibleGroups ||
        visibleGroups.firstRowIndex != this.visibleGroups.firstRowIndex ||
        visibleGroups.lastRowIndex != this.visibleGroups.lastRowIndex) {
      // The clearHiddenRows call above may have trimmed some of the rows, but not
      // all of them. Therefore, we may need to insert some rows at the beginning of
      // the viewport, and some rows at the end.
      var insertAfter = null;
      for (var i = viewport.firstRowIndex; i < viewport.lastRowIndex; i++) {
        var assetRowEl = this.assetRows[i].getEl();
        // A row that already has a parent is already in the DOM so we can safely
        // skip it.
        if (!assetRowEl.parent().length) {
          // First row wont have a previous sibling, so place at the front.
          if (!insertAfter) {
            this.viewportEl.prepend(assetRowEl);
          } else {
            assetRowEl.insertAfter(insertAfter);
          }
          this.assetRows[i].show();
        }
        insertAfter = assetRowEl;
      }
    
      this.currentViewport = viewport;
    }    
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
