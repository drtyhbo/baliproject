var ADD_PICTURES_NUM_COLUMNS = 3;
var ADD_PICTURES_SPACING = 5;
var USE_VARIOUS_SPACING_UI = true;

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
              background: 'black',
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
        if (this.imagesLoaded) {
            return;
        }
        this.imageEl.css('background-image',
                'url(' + this.assets[0].getSrc() + ')');
        this.imagesLoaded = true;
    }
});

var AssetRow = Class.extend({
    
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
        this.width = width;

        this.assets = assets;
        this.assetElements = [];

        this.isSelectable = false;
        // The callback for when the selection changes.
        this.selectionChangedCallback = null;

        this.selectAllEl = null;
        
        this.baseSpacing = ADD_PICTURES_SPACING;
        this.numColumns = ADD_PICTURES_NUM_COLUMNS;
        
        // The dimension of an individual picture. This corresponds to the
        // width and height since pictures are square.
        this.pictureDimension = (this.width - (this.baseSpacing * 2) -
				this.baseSpacing * (this.numColumns - 1)) /
				this.numColumns;
        // The height of an individual row is equal to the height of a picture
        // plus the interrow spacing.
        this.rowHeight = this.pictureDimension + this.baseSpacing;
        
        scroller.scroll(this.onScroll.bind(this));
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
        this.el = $('<div></div>')
                .css('padding', '0 ' + this.baseSpacing + 'px');

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
                                    this.pictureDimension * 2 + this.baseSpacing + 'px':
                                    this.pictureDimension + 'px',
                        marginBottom: isLastRow ? 0 : this.baseSpacing + 'px',
                        position: 'relative'
                    })
                    .appendTo(this.el);
            
            // Layout the row where one of the images is large.
            if (bigImageIndex != -1) {
                var isLeftAligned = bigImageCount++ % 2 == 0;
                var bigImageDimension = this.pictureDimension * 2 + this.baseSpacing;

                // Layout the big mama jama first.
                this.assetElements[bigImageIndex].getEl()
                    .css({
                        height: bigImageDimension + 'px',
                        left: isLeftAligned ?
                                0 : this.pictureDimension + this.baseSpacing + 'px',
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
                                    bigImageDimension + this.baseSpacing + 'px' :
                                    0,
                            position: 'absolute',
                            top: top,
            		        width: this.pictureDimension + 'px'
            		    })
                        .appendTo(currentRow);
                    top += this.pictureDimension + this.baseSpacing;  
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
                            left: (i % this.numColumns) * (this.pictureDimension + this.baseSpacing) + 'px',
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
        for (var i = 0, asset; asset = this.assets[i]; i++) {
            var numRows = Math.ceil(this.assets.length / this.numColumns);
            var isLastRow = i >= numRows * this.numColumns - this.numColumns;

            var thumbnailEl = $('<span></span>')
		      .css({
		          display: 'inline-block',
		          height: this.pictureDimension + 'px',
		          marginBottom: isLastRow ? 0 : this.baseSpacing,
		          marginLeft: i % this.numColumns != 0 ?
                          this.baseSpacing + 'px' :
                          0,
		          position: 'relative',
		          width: this.pictureDimension + 'px'
		      })
		      .appendTo(this.el);

            var assetElement = new AssetElement(asset, this.isSelectable,
                        this.selectionChanged.bind(this));
            this.assetElements.push(assetElement);
            assetElement.getEl()
                .appendTo(thumbnailEl);  
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
                          i % this.numColumns != 0 ?
                                  this.baseSpacing + 'px' : 0);
            }

            onRemoved();
        }).bind(this));
    },

    determineVisibleAssetIndices:
            function(elementTop, scrollPosition, parentHeight) {
        var firstRow = elementTop - scrollPosition.y > 0 ?
                0 : Math.ceil(Math.abs(elementTop - scrollPosition.y) / this.rowHeight);
        var lastRow = Math.ceil((parentHeight - elementTop + scrollPosition.y) / this.rowHeight);

        return {
            first: firstRow * this.numColumns,
            last: lastRow * this.numColumns
        };
    },

    /**
     * Called when the user scrolls the view.
     */
    onScroll: function(scroller, scrollPosition, parentHeight) {
        var scrollerEl = scroller.getEl();
        var elementTop = this.el.offset().top - scrollerEl.offset().top;
        var assetIndices = this.determineVisibleAssetIndices(elementTop,
                scrollPosition, parentHeight);
        for (var i = assetIndices.first; i < assetIndices.last; i++) {
            this.assetElements[i].loadImages();
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