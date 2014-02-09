var ADD_PICTURES_NUM_COLUMNS = 3;
var ADD_PICTURES_SPACING = 5;
var USE_VARIOUS_SPACING_UI = true;

var AssetElement = Class.extend({
    init: function(asset) {
        this.assets = [];
        this.addAsset(asset);
        
        this.nextAsset = 1;
        this.el = null;
        this.imageEl = null;
        this.nextImageEl = null;

        this.offset = null;
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
    
    stepAnimation: function() {
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
    
    getEl: function() {
        this.el = $('<div></div>');

        this.imageEl = this.getImageEl(this.assets[0].getSrc())
              .appendTo(this.el);
        if (this.assets.length > 1) {
            this.nextImageEl = this.getImageEl(this.assets[1].getSrc())
                .css('opacity', 0)
                .appendTo(this.el);
        }

        //if picture is selectable, add selection UI elements and event handlers
        if (this.isSelectable) {
            var fadedEl = $('<span></span>')
				    .css({
				        background: '#ffffff',
				        display: 'none',
				        height: '100%',
				        left: 0,
				        opacity: 0.35,
				        position: 'absolute',
				        top: 0,
				        width: '100%'
				    })
				    .appendTo(this.el);

            var checkedEl = $('<img></img>')
				    .css({
				        bottom: 5,
				        display: 'none',
				        position: 'absolute',
				        right: 5
				    })
				    .attr('src', Images.getPath() + 'check.png')
				    .appendTo(this.el);

            this.el.on(TOUCHSTART, this.touchStart.bind(this));
            this.el.on('touchmove', this.touchMove.bind(this));
            this.el.on(TOUCHEND, this.touchEnd.bind(this, picture));
        }
        return this.el;
    },
    
    getImageEl: function(url) {
        return $('<span></span>')
	      .css({
	          backgroundImage: 'url(' + url + ')',
	          backgroundSize: 'cover',
	          display: 'inline-block',
	          height: '100%',
	          left: 0,
	          position: 'absolute',
	          top: 0,
	          width: '100%'
	      });
    }
});

/**
 * Encapulates the logic for a picture selector based around the camera roll.
 */
var AddPictures = Class.extend({
    /**
     * width - The width of the parent.
     * showSelectAll - If true, displays the Select all/Select none link.
     * onSelectionChanged - Called when the user selects/deselects pictures (only called if isSelectable is set to true)
     * isSelectable - If true, user can select the images
     * assets - List of assets to be displayed.
     * baseSpacing - The amount of spacing between pictures.
     * numColumns - The number of columns per row.
     */
    init: function (width, showSelectAll, isSelectable, onSelectionChanged,
            assets, baseSpacing, numColumns) {
        this.numSelected = 0;
        this.assets = assets;
        this.pictures = [];
        this.selectAllEl = null;
        this.showSelectAll = showSelectAll;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isSelectable = isSelectable;
        this.onSelectionChanged = this.isSelectable ? onSelectionChanged : null;
        this.width = width;
        this.baseSpacing = baseSpacing !== undefined ?
                baseSpacing : ADD_PICTURES_SPACING;
        this.numColumns = numColumns !== undefined ?
                numColumns : ADD_PICTURES_NUM_COLUMNS;
        this.animateId = setInterval(this.onStepAnimation.bind(this), 2000);
    },

    /**
     * Creates and returns the picture selector element. Only adds pictures that
     * are not currently added to the personal library.
     */
    getEl: function () {
        var pictureDimension = (this.width - (this.baseSpacing * 2) -
				this.baseSpacing * (this.numColumns - 1)) /
				this.numColumns;

        this.picturesEl = $('<div></div>')
                .css('padding', '0 ' + this.baseSpacing + 'px');

        //add show all link 
        if (this.showSelectAll) {
            var selectAllContainerEl = $('<div></div>')
					.css({
					    marginBottom: '10px',
					    textAlign: 'right'
					})
					.appendTo(this.picturesEl);
            this.selectAllEl = $('<span></span>')
					.css({
					    color: 'blue',
					    cursor: 'pointer'
					})
					.text('Select all')
					.on(TOUCHEND, this.toggleSelectAll.bind(this))
					.appendTo(selectAllContainerEl);
        }
        
        if (USE_VARIOUS_SPACING_UI) {
            this.renderVariousSpacingUi(pictureDimension);
        } else {
            this.renderStandardUi(pictureDimension);
        }

        return this.picturesEl;
    },

    renderVariousSpacingUi: function(pictureDimension) {
        this.animatedAssetElements = [];

        var lastAsset = null;
        var assetElements = [];
        for (var i = 0, asset; asset = this.assets[i]; i++) {
            if (lastAsset && asset.timestamp - lastAsset.timestamp < 15) {
                assetElements[assetElements.length - 1].addAsset(asset);
            } else {
                // Keep track of all the animated elements so we can step
                // through them later.
                if (assetElements.length > 0 &&
                        assetElements[assetElements.length - 1].getNumFrames() > 1) {
                    this.animatedAssetElements.push(
                            assetElements[assetElements.length - 1]);
                }
                assetElements.push(new AssetElement(asset));
            }
            lastAsset = asset;
        }
        var bigImageCount = 0;
        var numRows = Math.ceil(assetElements.length / 3);
        for (var row = 0; row < numRows; row++) {
            var start = row * 3;
            var isLastRow = false;

            var numFrames = 0;
            var bigImageIndex = -1;
            // Only make an asset large if the row is full.
            if (assetElements.length - start > 2) {
                // Determine if any of the assets are animated and thus should
                // be displayed large.
                for (var i = start, assetElement; i < start + 3; i++) {
                    assetElement = assetElements[i];
                    if (!assetElement) {
                        break;
                    }
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
                                    pictureDimension * 2 + this.baseSpacing + 'px':
                                    pictureDimension + 'px',
                        marginBottom: isLastRow ? 0 : this.baseSpacing + 'px',
                        position: 'relative'
                    })
                    .appendTo(this.picturesEl);
            
            // Layout the row where one of the images is large.
            if (bigImageIndex != -1) {
                var isLeftAligned = bigImageCount++ % 2 == 0;
                var bigImageDimension = pictureDimension * 2 + this.baseSpacing;

                // Layout the big mama jama first.
                assetElements[bigImageIndex].getEl()
                    .css({
                        height: bigImageDimension + 'px',
                        left: isLeftAligned ?
                                0 : pictureDimension + this.baseSpacing + 'px',
                        position: 'absolute',
                        top: 0,
        		        width: bigImageDimension + 'px'
        		    })
                    .appendTo(currentRow);

                for (var i = start, top = 0, assetElement; i < start + 3; i++) {
                    if (i == bigImageIndex) {
                        continue;
                    }
                    assetElement = assetElements[i];
                    if (!assetElement) {
                        break;
                    }
                    assetElement.getEl()
                        .css({
                            height: pictureDimension + 'px',
                            left: isLeftAligned ?
                                    bigImageDimension + this.baseSpacing + 'px' :
                                    0,
                            position: 'absolute',
                            top: top,
            		        width: pictureDimension + 'px'
            		    })
                        .appendTo(currentRow);
                    top += pictureDimension + this.baseSpacing;  
                }
            // Layout the row where all the images are small.
            } else {
                for (var i = start, assetElement; i < start + 3; i++) {
                    assetElement = assetElements[i];
                    if (!assetElement) {
                        break;
                    }
                    var thumbnailEl = assetElement.getEl()
                        .css({
                            left: (i % this.numColumns) * (pictureDimension + this.baseSpacing) + 'px',
                            height: pictureDimension + 'px',
                            position: 'absolute',
                            top: 0,
            		        width: pictureDimension + 'px'
            		    }) 
                        .appendTo(currentRow);

                }
            }
        }
    },
    
    renderStandardUi: function(pictureDimensiono) {
        for (var i = 0, asset; asset = this.assets[i]; i++) {
            var numRows = Math.ceil(this.assets.length / this.numColumns);
            var isLastRow = i >= numRows * this.numColumns - this.numColumns;

            var thumbnailEl = $('<span></span>')
		      .css({
		          display: 'inline-block',
		          height: pictureDimension + 'px',
		          marginBottom: isLastRow ? 0 : this.baseSpacing,
		          marginLeft: i % this.numColumns != 0 ?
                          this.baseSpacing + 'px' :
                          0,
		          position: 'relative',
		          width: pictureDimension + 'px'
		      })
		      .appendTo(this.picturesEl);

            var imageEl = $('<span></span>')
		      .css({
		          backgroundImage: 'url(' + asset.getSrc() + ')',
		          backgroundSize: 'cover',
		          display: 'inline-block',
		          height: '100%',
		          left: 0,
		          position: 'absolute',
		          top: 0,
		          width: '100%'
		      })
			  .appendTo(thumbnailEl);

            //if picture is selectable, add selection UI elements and event handlers
            if (this.isSelectable) {
                var fadedEl = $('<span></span>')
					    .css({
					        background: '#ffffff',
					        display: 'none',
					        height: '100%',
					        left: 0,
					        opacity: 0.35,
					        position: 'absolute',
					        top: 0,
					        width: '100%'
					    })
					    .appendTo(thumbnailEl);

                var checkedEl = $('<img></img>')
					    .css({
					        bottom: 5,
					        display: 'none',
					        position: 'absolute',
					        right: 5
					    })
					    .attr('src', Images.getPath() + 'check.png')
					    .appendTo(thumbnailEl);

                var picture = {
                    isSelected: false,
                    asset: asset,
                    fadedEl: fadedEl,
                    checkedEl: checkedEl,
                    thumbnailEl: thumbnailEl
                };
                this.pictures.push(picture);

                thumbnailEl.on(TOUCHSTART, this.touchStart.bind(this));
                thumbnailEl.on('touchmove', this.touchMove.bind(this));
                thumbnailEl.on(TOUCHEND, this.touchEnd.bind(this, picture));
            }
        }
    },

    /**
     * Returns the number of pictures being displayed.
     */
    getNumPictures: function () {
        return this.pictures.length;
    },

    /**
     * Returns an array containing all the pictures that are currently
     * selected.
     */
    getSelected: function () {
        var assets = [];
        for (var i = 0, picture; picture = this.pictures[i]; i++) {
            if (!picture.isSelected) {
                continue;
            }
            assets.push(picture.asset);
        }
        return assets;
    },

    /**
	 * Toggles the selected status of an individual picture.
	 */
    toggleSelectedStatus: function (picture) {
        var isSelected = picture.isSelected;
        picture.isSelected = !picture.isSelected;

        if (!isSelected) {
            picture.thumbnailEl.addClass('selected');
            picture.fadedEl.show();
            picture.checkedEl.show();
            this.setSelectAllText(this.areAllSelected());
            this.numSelected++;
        } else {
            picture.thumbnailEl.removeClass('selected');
            picture.fadedEl.hide();
            picture.checkedEl.hide();
            this.setSelectAllText(false);
            this.numSelected--;
        }
    },

    /**
	 * Returns true if all the pictures are selected.
	 */
    areAllSelected: function () {
        for (var i = 0, picture; picture = this.pictures[i]; i++) {
            if (!picture.isSelected) {
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
            for (var i = 0, picture; picture = this.pictures[i]; i++) {
                this.toggleSelectedStatus(picture);
            }
            this.setSelectAllText(false);
            this.numSelected = 0;
        } else {
            for (var i = 0, picture; picture = this.pictures[i]; i++) {
                if (!picture.isSelected) {
                    this.toggleSelectedStatus(picture);
                }
            }
            this.setSelectAllText(true);
            this.numSelected = this.pictures.length;
        }

        if (this.onSelectionChanged) {
            this.onSelectionChanged(this.numSelected);
        }
    },

    /**
	 * Removes all the selected pictures.
	 */
    removeSelected: function (onRemoved) {
        var selectedPicturesEl = this.picturesEl.find('.selected');
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
            this.numSelected = 0;

            // Update the remaining margins.
            for (var i = 0, picture; picture = this.pictures[i]; i++) {
                picture.thumbnailEl.css('margin-left',
                          i % this.numColumns != 0 ?
                                  this.baseSpacing + 'px' : 0);
            }

            onRemoved();
        }).bind(this));
    },

    /**
	 * Event handler. Called when the user first touches an image.
	 */
    touchStart: function (e) {
        this.touchStartY = this.touchEndY = e.originalEvent.pageY;
    },

    /**
	 * Event handler. Called when the user moves her finger. We intercept this event
	 * to keep track of how far the user is moving her finger.
	 */
    touchMove: function (e) {
        this.touchEndY = e.originalEvent.pageY;
    },

    /**
	 * Event handler. Called when the touch ends. Only toggle the select status of
	 * the image if the user hasn't moved her finger by very much.
	 */
    touchEnd: function (picture) {
        if (Math.abs(this.touchEndY - this.touchStartY) < 5) {
            this.toggleSelectedStatus(picture);
            if (this.onSelectionChanged) {
                this.onSelectionChanged(this.numSelected);
            }
        }
    },
    
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