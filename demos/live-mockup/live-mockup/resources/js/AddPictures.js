var ADD_PICTURES_PAGE_SPACING = 10;
var ADD_PICTURES_NUM_COLUMNS = 3;
var ADD_PICTURES_SPACING = 5;

var AddPictures = Class.extend({
	init: function(width, onSelectionChanged) {
		this.numSelected = 0;
		this.onSelectionChanged = onSelectionChanged;
		this.pictures = [];
		this.selectAllEl = null;
		this.touchStartY = 0;
		this.touchEndY = 0;
		this.width = width;
	},
	
	getEl: function() {
		var pictureDimension = (this.width - ADD_PICTURES_PAGE_SPACING -
				ADD_PICTURES_SPACING * (ADD_PICTURES_NUM_COLUMNS - 1)) /
				ADD_PICTURES_NUM_COLUMNS;
		
		var picturesEl = $('<div></div>');
		
		var selectAllContainerEl = $('<div></div>')
				.css({
					marginBottom: '10px',
					textAlign: 'right'
				})
				.appendTo(picturesEl);				
		this.selectAllEl = $('<span></span>')
				.css({
					color: 'blue',
					cursor: 'pointer'
				})
				.text('Select all')
				.on(TOUCHEND, this.toggleSelectAll.bind(this))
				.appendTo(selectAllContainerEl);

		var cameraRoll = CameraRoll.getCameraRoll();
		for (var i = 0, asset; asset = cameraRoll[i]; i++) {
			var thumbnailEl = $('<span></span>')
		      .css({
						display: 'inline-block',
						height: pictureDimension + 'px',
						marginBottom: '5px',
						marginLeft:
								i % ADD_PICTURES_NUM_COLUMNS != 0 ?
										ADD_PICTURES_SPACING + 'px' :
										0,
						position: 'relative',
					  width: pictureDimension + 'px'
					})
					.appendTo(picturesEl);

			var imageEl = $('<span></span>')
		      .css({
						backgroundImage: 'url(' + asset.getThumbSrc() + ')',
		        backgroundSize: 'cover',
						display: 'inline-block',
						height: '100%',
						left: 0,
						position: 'absolute',
						top: 0,
						width: '100%'
					})
					.appendTo(thumbnailEl);

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
				checkedEl: checkedEl
			};
			this.pictures.push(picture);

			thumbnailEl.on(TOUCHSTART, this.touchStart.bind(this));
			thumbnailEl.on('touchmove', this.touchMove.bind(this));
			thumbnailEl.on(TOUCHEND, this.touchEnd.bind(this, picture));
		}
		
		this.toggleSelectAll();
		
		return picturesEl;
	},

	getSelected: function() {
		var pictures = [];
		for (var i = 0, picture; picture = this.pictures[i]; i++) {
			if (!picture.isSelected) {
				continue;
			}
			pictures.push(picture.asset);
		}
		return pictures;
	},

	/**
	 * Toggles the selected status of an individual image.
	 */
	toggleSelectedStatus: function(picture) {
		var isSelected = picture.isSelected;
		picture.isSelected = !picture.isSelected;

		if (!isSelected) {
			picture.fadedEl.show();
			picture.checkedEl.show();
			this.setSelectAllText(this.areAllSelected());
			this.numSelected++;
		} else {
			picture.fadedEl.hide();
			picture.checkedEl.hide();		
			this.setSelectAllText(false);
			this.numSelected--;
		}
	},

	/**
	 * Returns true if all the pictures are selected.
	 */
	areAllSelected: function() {
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
	setSelectAllText: function(areAllSelected) {
		this.selectAllEl.text(
				areAllSelected ? 'Select none' : 'Select all');
	},

	/**
	 * Toggles the selected status of the images. When:
	 *   All are already selected: Unselects all of them.
	 *   Some are unselected: Selects all of them.
	 */
	toggleSelectAll: function(e) {
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
	 * Event handler. Called when the user first touches an image.
	 */
	touchStart: function(e) {
		this.touchStartY = this.touchEndY = e.originalEvent.pageY;
	},

	/**
	 * Event handler. Called when the user moves her finger. We intercept this event
	 * to keep track of how far the user is moving her finger.
	 */
	touchMove: function(e) {
		this.touchEndY = e.originalEvent.pageY;
	},

	/**
	 * Event handler. Called when the touch ends. Only toggle the select status of
	 * the image if the user hasn't moved her finger by very much.
	 */
	touchEnd: function(picture) {
		if (Math.abs(this.touchEndY - this.touchStartY) < 5) {
			this.toggleSelectedStatus(picture);
			if (this.onSelectionChanged) {
				this.onSelectionChanged(this.numSelected);
			}
		}
	}
});