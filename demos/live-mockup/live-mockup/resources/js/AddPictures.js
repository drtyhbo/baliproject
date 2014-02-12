var NUM_COLUMNS = 3;
var PICTURE_SPACING = 5;
var USE_VARIOUS_SPACING_UI = false;

var AssetElement = Class.extend({
    init: function (asset, isSelectable, onSelectionChanged) {
        this.assets = [];
        this.addAsset(asset);
        
        this.nextAsset = 1;
        this.el = null;
        this.imageEl = null;
        this.nextImageEl = null;
        this.fadedEl = null;
        this.checkedEl = null;
        this.offset = null;

        this.isSelectable = isSelectable || false;
        this.onSelectionChanged = onSelectionChanged || null;
        this.isSelected = false; 
        
        // True when the images have been loaded for this asset.
        this.imagesLoaded = false;       
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
    
    getNumFrames: function() {
        return this.assets.length;
    },

    setSelectable: function (isSelectable, onSelectionChanged) {
        this.isSelectable = isSelectable;
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

    touchStart: function (e) {
        this.touchStartY = this.touchEndY = e.originalEvent.pageY;
    },

    touchMove: function (e) {
        this.touchEndY = e.originalEvent.pageY;
    },

    touchEnd: function (picture) {
        if (Math.abs(this.touchEndY - this.touchStartY) < 5
            && this.isSelectable) {
            this.toggleSelectedStatus();
            if (this.onSelectionChanged) {
                this.onSelectionChanged();
            }
        }
    },

    toggleSelectedStatus: function () {
        this.isSelected = !this.isSelected;

        if (this.isSelected) {
            //this.thumbnailEl.addClass('selected');
            this.fadedEl.show();
            this.checkedEl.show();
        } else {
            //picture.thumbnailEl.removeClass('selected');
            this.fadedEl.hide();
            this.checkedEl.hide();
        }
    },

    getEl: function () {
        this.el = $('<div></div>');

        this.imageEl = this.getImageEl(this.assets[0].getSrc())
              .appendTo(this.el);
        if (this.assets.length > 1) {
            this.nextImageEl = this.getImageEl(this.assets[1].getSrc())
                .css('opacity', 0)
                .appendTo(this.el);
        }

        this.fadedEl = $('<span></span>')
				.css({
				    background: '#ffffff',
				    display: 'none',
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
				    display: 'none',
				    position: 'absolute',
				    right: 5,
				    zIndex: 2
				})
				.attr('src', Images.getPath() + 'check.png')
				.appendTo(this.el);


        this.el.on(TOUCHSTART, this.touchStart.bind(this));
        this.el.on('touchmove', this.touchMove.bind(this));
        this.el.on(TOUCHEND, this.touchEnd.bind(this));

        return this.el;
    },

    getImageEl: function(url) {
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
    
    loadImages: function() {
      this.imageEl.css('background-image', 'url(' + this.assets[0].getSrc() + ')');
    }
});

/**
 * Encapulates the logic to handle a row of asset elements.
 */
var AssetRowElement = Class.extend({
   init: function(assets, pictureDimension) {
     this.el = null;
     this.assetElements = [];
     for (var i = 0, asset; asset = assets[i]; i++) {
       this.assetElements.push(new AssetElement(asset, false, null));
     }
     this.pictureDimension = pictureDimension;
     
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
       var parentEl = $('<span></span>')
           .css({
               display: 'inline-block',
               height: this.pictureDimension + 'px',
               marginLeft: i % this.assetElements.length != 0 ?
                           PICTURE_SPACING + 'px' :
                           0,
               position: 'relative',
               width: this.pictureDimension + 'px'
           })
           .appendTo(this.el);
       assetElement.getEl()
           .appendTo(parentEl);
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
     this.loadImagesTimerId = setTimeout(this.loadImages.bind(this), 500);
   },
   
   /**
    * Should be called when the asset row is hidden.
    */
   hide: function() {
     this.shown = false;
     
     clearTimeout(this.loadImagesTimerId);
     this.loadImagesTimerId = 0;
   },
   
   loadImages: function() {
     for (var i = 0, assetElement;
         assetElement = this.assetElements[i]; i++) {
       assetElement.loadImages();
     }
     this.imagesLoaded = true;     
   }
});

/**
 * Encapulates the logic for a picture selector based around the camera roll.
 */
var AddPictures = Class.extend({
    /**
     * props - The list of configuration properties.
     *   width - The width of the parent element.
     *   assets - The list of assets to render.
     *   scroller - The scroller object that encompasses this set of pictures.
     */
    init: function(width, assets, scroller) {
      // The main element for the picture selector.
      this.el = null;
      // This block contains all the content which is above the viewport.
      this.aboveViewportEl = null;
      // This block contains all the content which is in the viewport.
      this.viewportEl = null;
      // This block contains all the content which is below the viewport.
      this.belowViewportEl = null;
      // Specifies which rows are currently in the viewport. Object with
      // two properties:
      //     firstRowIndex - The index of the first row.
      //     lastRowIndex - The index of the last row.
      this.currentViewport = null;

      this.width = width;

      this.assets = assets;
      this.assetRows = [];

      this.isSelectable = false;
      // The callback for when the selection changes.
      this.selectionChangedCallback = null;

      this.selectAllEl = null;
      
      // The dimension of an individual picture. This corresponds to the
      // width and height since pictures are square.
      this.pictureDimension = (this.width - (PICTURE_SPACING * 2) -
          PICTURE_SPACING * (NUM_COLUMNS - 1)) /
          NUM_COLUMNS;
      // The height of an individual row is equal to the height of a picture
      // plus the interrow spacing.
      this.rowHeight = this.pictureDimension + PICTURE_SPACING;
      
      this.scroller = scroller;
      this.scroller.scroll(this.onScroll.bind(this));
    },

    /**
     * Called when a picture selection changed to set the text on the 'select all' link
     * and also calls onSelectionChangedCallback
     */
    selectionChanged: function () {
        //set select all text
        this.setSelectAllText(me.areAllSelected());
        
        //callback
        if (this.isSelectable && this.onSelectionChangedCallback) {
            this.onSelectionChangedCallback(this.getSelected().length);
        }
    },
    
    /**
     * Creates and returns the picture selector element. Only adds pictures that
     * are not currently added to the personal library.
     */
    getEl: function () {
        //top level div
        this.el = $('<div></div>');

        this.aboveViewportEl = $('<div></div>')
            .appendTo(this.el);
        this.viewportEl = $('<div></div>')
            .appendTo(this.el);
        this.belowViewportEl = $('<div></div>')
            .appendTo(this.el);

        this.selectAllContainerEl = $('<div></div>')
				.css({
            display: 'none',
				    marginBottom: '10px',
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
        
        //render pics
        if (USE_VARIOUS_SPACING_UI) {
            this.renderVariousSpacingUi();
        } else {
            this.renderStandardUi();
        }

        return this.el;
    },

    /**
     * Render pictures in an animated view
     */
    renderVariousSpacingUi: function() {
        this.animatedAssetElements = [];

        var lastAsset = null;

        //parse assets into assetelements with assets that are within 15
        //of each other belonging to the same assetelement
        for (var i = 0, asset; asset = this.assets[i]; i++) {
            if (lastAsset && asset.timestamp - lastAsset.timestamp < 15) {
                this.assetElements[this.assetElements.length - 1].addAsset(asset);
            } else {
                // Keep track of all the animated elements so we can step
                // through them later.
                if (this.assetElements.length > 0 &&
                        this.assetElements[this.assetElements.length - 1].getNumFrames() > 1) {
                    this.animatedAssetElements.push(
                            this.assetElements[this.assetElements.length - 1]);
                }
                this.assetElements.push(
                        new AssetElement(asset, this.isSelectable,
                                this.selectionChanged.bind(this)));
            }
            lastAsset = asset;
        }

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
     * Render pictures in a regular grid
     */
    renderStandardUi: function() {
      // The DOM for the various asset rows will be created dynamically, so
      // we need to set a fixed height now.
      var numRows = Math.ceil(this.assets.length / NUM_COLUMNS);
      this.el.css('height',
          numRows * (this.pictureDimension + PICTURE_SPACING));

      var numAssets = this.assets.length;
      for (var i = 0; i < numAssets; i += 3) {
        var assetsForRow = [];
        for (var j = i; j < numAssets && j < i + 3; j++) {
          assetsForRow.push(this.assets[j]);
        }
        this.assetRows.push(new AssetRowElement(assetsForRow, this.pictureDimension));
      }
    },
    
    /**
     * Enable/disable the ability to select assets.
     * isSelectable - True to enable, false to disable.
     * selectionChangedCallback - This gets called when the set of selected
     *    items changes.
     * enableSelectAll - True to enable the Select all/Select none link.
     */
    enableSelection: function(isSelectable, selectionChangedCallback,
            enableSelectAll) {
        this.isSelectable = isSelectable;
        this.selectionChangedCallback = selectionChangedCallback;
        if (this.isSelectable && enableSelectAll) {
            this.selectAllContainerEl.css('display', 'block');
        }
    },

    /**
     * Returns the number of pictures being displayed.
     */
    getNumPictures: function () {
        return this.assets.length;
    },

    /**
     * Returns an array containing all the pictures that are currently
     * selected.
     */
    getSelected: function () {
        var assets = [];
        for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
            if (!assetElement.isSelected || !assetElement.assets)
                continue;
            
            for (var j = 0, asset; asset = assetElement.assets[j]; j++)
                assets.push(asset);
        }
        return assets;
    },

    /**
	 * Returns true if all the pictures are selected.
	 */
    areAllSelected: function () {
        for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
            if (!assetElement.isSelected) {
                return false;
            }
        }
        return true;
    },

    /**
	 * Sets the text on the Select all/Select none link. Sets text to:
	 *   All are already selected: "Select none".
	 *   Some are unselected: "Select all".
	 */
    setSelectAllText: function (areAllSelected) {
        if (!this.selectAllEl) {
            return;
        }

        this.selectAllEl.text(
				areAllSelected ? 'Select none' : 'Select all');
    },

    /**
	 * Toggles the selected status of the images. When:
	 *   All are already selected: Unselects all of them.
	 *   Some are unselected: Selects all of them.
	 */
    toggleSelectAll: function (e) {
        if (this.areAllSelected()) {
            for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
                assetElements.toggleSelectedStatus();
            }
            this.setSelectAllText(false);
        } 
        else {
            for (var i = 0, assetElement; assetElement = this.assetElements[i]; i++) {
                if (!assetElement.isSelected) {
                    this.toggleSelectedStatus(assetElement);
                }
            }
            this.setSelectAllText(true);
        }

        if (this.onSelectionChanged) {
            this.onSelectionChanged(this.numSelected);
        }
    },

    /**
	 * Removes all the selected pictures.
	 */
    removeSelected: function (onRemoved) {
        var selectedPicturesEl = this.el.find('.selected');
        var alreadyRemoved = false;
        selectedPicturesEl.animate({
            opacity: 0
        }, 500, 'swing', (function () {
            // This gets called for each picture. Only need to remove the pictures
            // once.
            if (alreadyRemoved) {
                return;
            }
            alreadyRemoved = true;

            selectedPicturesEl.remove();
            // Remove the selected pictures from the list of pictures.
            for (var i = this.pictures.length - 1; i >= 0; i--) {
                if (this.pictures[i].isSelected) {
                    this.pictures.splice(i, 1);
                }
            }

            // Update the remaining margins.
            for (var i = 0, picture; picture = this.pictures[i]; i++) {
                picture.thumbnailEl.css('margin-left',
                          i % NUM_COLUMNS != 0 ?
                                  PICTURE_SPACING + 'px' : 0);
            }

            onRemoved();
        }).bind(this));
    },

    determineViewport: function(scrollPosition, parentHeight) {
      // The picture selector might not be flush with the top of the scrollable content,
      // so calculate the scroll top as if the picture selector were at the top.
      var relativeScrollTop = scrollPosition.y -
          (this.el.offset().top - this.scroller.getEl().offset().top);

      // A negative relativeScrollTop means the picture selector is further down on the
      // page, perhaps all the way off the screen.
      if (relativeScrollTop < 0 && relativeScrollTop < -parentHeight) {
        // Not visible.
        return null;
      } else if (relativeScrollTop < 0) {
        var firstRowIndex = 0;
      } else {
        var firstRowIndex = Math.floor(relativeScrollTop / this.rowHeight);
      }
      var lastRowIndex = Math.ceil((relativeScrollTop + parentHeight) / this.rowHeight);

      return {
        firstRowIndex: firstRowIndex,
        lastRowIndex: lastRowIndex
      };
    },

    /**
     * Determines which rows are now hidden and removes them from the DOM.
     */
    clearHiddenRows: function(viewport) {
      for (var i = this.currentViewport.firstRowIndex;
          i < this.currentViewport.lastRowIndex; i++) {
        if (i < viewport.firstRowIndex || i >= viewport.lastRowIndex) {
          this.assetRows[i].getEl().detach();
          this.assetRows[i].hide();
        }
      }
    },

    /**
     * Called when the user scrolls the view.
     */
    onScroll: function(scroller, scrollPosition, parentHeight) {
      // This optimization works by only showing those rows in the DOM that are
      // currently within the viewport. There are three divs in the following DOM
      // order:
      //
      // - aboveViewportEl
      // - viewportEl
      // - belowViewportEl
      //
      // The viewportEl element is the only one that contains content. The other two
      // elements are used to pad the height of the content div to keep the scroll
      // height the same.
      //
      // Each time the page moves, we calculate the current viewport, show/hide rows
      // as necessary, and update the height of the various viewport sections.
      var viewport = this.determineViewport(scrollPosition, parentHeight);

      if (this.currentViewport) {
        this.clearHiddenRows(viewport);
      }

      this.aboveViewportEl.css('height',
          viewport.firstRowIndex * this.rowHeight + 'px');
      this.viewportEl.css('height',
          (viewport.lastRowIndex - viewport.firstRowIndex) * this.rowHeight + 'px');
      this.belowViewportEl.css('height',
          (this.assetRows.length - viewport.lastRowIndex) * this.rowHeight + 'px');

      if (!this.currentViewport ||
          viewport.firstRowIndex != this.currentViewport.firstRowIndex ||
          viewport.lastRowIndex != this.currentViewport.lastRowIndex) {
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