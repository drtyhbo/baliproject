var ADD_PICTURES_PAGE_SPACING = 10;
var ADD_PICTURES_NUM_COLUMNS = 3;
var ADD_PICTURES_SPACING = 5;

/**
 * Encapulates the logic for a picture selector based around the camera roll.
 */
var AddPictures = Class.extend({
    /**
     * showSelectAll - If true, displays the Select all/Select none link.
     * onSelectionChanged - Called when the user selects/deselects pictures (only called if isSelectable is set to true)
     * isSelectable - If true, user can select the images
     * assets - List of assets to be displayed.
     */
    init: function (width, showSelectAll, isSelectable, onSelectionChanged, assets) {
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
    },

    /**
     * Creates and returns the picture selector element. Only adds pictures that
     * are not currently added to the personal library.
     */
    getEl: function () {
        var pictureDimension = (this.width - ADD_PICTURES_PAGE_SPACING -
				ADD_PICTURES_SPACING * (ADD_PICTURES_NUM_COLUMNS - 1)) /
				ADD_PICTURES_NUM_COLUMNS;

        this.picturesEl = $('<div></div>');

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

        //generate pictures
        var numPictures = 0;
        for (var i = 0, asset; asset = this.assets[i]; i++) {
            var thumbnailEl = $('<span></span>')
		      .css({
		          display: 'inline-block',
		          height: pictureDimension + 'px',
		          marginBottom: '5px',
		          marginLeft:
                          numPictures++ % ADD_PICTURES_NUM_COLUMNS != 0 ?
                                  ADD_PICTURES_SPACING + 'px' :
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
                    picture: picture,
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

        return this.picturesEl;
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
        var pictures = [];
        for (var i = 0, picture; picture = this.pictures[i]; i++) {
            if (!picture.isSelected) {
                continue;
            }
            pictures.push(picture.picture);
        }
        return pictures;
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
                          i % ADD_PICTURES_NUM_COLUMNS != 0 ?
                                  ADD_PICTURES_SPACING + 'px' :
                                  0);
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
    }
});