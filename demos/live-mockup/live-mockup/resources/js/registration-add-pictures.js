var RegistrationAddPictures = {
	footerEl: null,
	numSelected: 0,
	pictures: null,
	selectAllEl: null,
	touchStartY: 0,
	touchEndY: 0
};

RegistrationAddPictures.PAGE_SPACING = 35;
RegistrationAddPictures.NUM_COLUMNS = 3;
RegistrationAddPictures.SPACING = 5;

/**
 * Makes the add pictures registration page the current page.
 */
RegistrationAddPictures.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationAddPictures.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change', '#registration-add-pictures', {
		changeHash: false,
		showLoadMsg: false,
		transition: animate ? 'slide' : 'none'
	});
};

/**
 * Event handler. Called before the add pictures registration page is made
 * visible.
 */
RegistrationAddPictures.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#registration-add-pictures') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	RegistrationAddPictures.pictures = [];

	RegistrationAddPictures.numSelected = 0;
	RegistrationAddPictures.footerEl = ui.toPage
			.find('#add-pictures-footer')
			.on(TOUCHSTART, RegistrationAddPictures.touchFooterButton);
	RegistrationAddPictures.selectAllEl = ui.toPage
			.find('#select-all')
			.on(TOUCHSTART, RegistrationAddPictures.toggleSelectAll);

  var pictures = ui.toPage.find('#pictures');
	var pictureDimension = (ui.toPage.width() -
			RegistrationAddPictures.PAGE_SPACING -
			RegistrationAddPictures.SPACING *
					(RegistrationAddPictures.NUM_COLUMNS - 1)) /
			RegistrationAddPictures.NUM_COLUMNS;

	var cameraRoll = CameraRoll.getCameraRoll();
	for (var i = 0, asset; asset = cameraRoll[i]; i++) {
		var thumbnailEl = $('<span></span>')
        .css({
					display: 'inline-block',
					height: pictureDimension + 'px',
					marginBottom: '5px',
					marginLeft:
							i % RegistrationAddPictures.NUM_COLUMNS != 0 ?
									RegistrationAddPictures.SPACING + 'px' :
									0,
					position: 'relative',
				  width: pictureDimension + 'px'
				})
				.appendTo(pictures);

		var imageEl = $('<span></span>')
        .css({
					backgroundImage: 'url(' + CameraRoll.getThumb(asset) + ')',
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
		RegistrationAddPictures.pictures.push(picture);

		thumbnailEl.on(TOUCHSTART, RegistrationAddPictures.touchStart);
		thumbnailEl.on('touchmove', RegistrationAddPictures.touchMove);
		thumbnailEl.on(TOUCHEND,
				RegistrationAddPictures.touchEnd.bind(this, picture));
	}
	
	RegistrationAddPictures.toggleSelectAll();
};

/**
 * Returns true if all the pictures are selected.
 */
RegistrationAddPictures.areAllSelected = function() {
	for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
		if (!picture.isSelected) {
			return false;
		}
	}
	return true;
};

/**
 * Sets the text on the Select all/Select none link. Sets text to:
 *   All are already selected: "Select none".
 *   Some are unselected: "Select all".
 */
RegistrationAddPictures.setSelectAllText = function(areAllSelected) {
	RegistrationAddPictures.selectAllEl.text(
			areAllSelected ? 'Select none' : 'Select all');
};

/**
 * Toggles the selected status of the images. When:
 *   All are already selected: Unselects all of them.
 *   Some are unselected: Selects all of them.
 */
RegistrationAddPictures.toggleSelectAll = function(e) {
	if (RegistrationAddPictures.areAllSelected()) {
		for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
			RegistrationAddPictures.toggleSelectedStatus(picture);
		}
		RegistrationAddPictures.setSelectAllText(false);
		RegistrationAddPictures.numSelected = 0;
	} else {
		for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
			if (!picture.isSelected) {
				RegistrationAddPictures.toggleSelectedStatus(picture);
			}
		}
		RegistrationAddPictures.setSelectAllText(true);
		RegistrationAddPictures.numSelected = RegistrationAddPictures.pictures.length;
	}
};

/**
 * Toggles the selected status of an individual image.
 */
RegistrationAddPictures.toggleSelectedStatus = function(picture) {
	var isSelected = picture.isSelected;
	picture.isSelected = !picture.isSelected;

	if (!isSelected) {
		picture.fadedEl.show();
		picture.checkedEl.show();
		RegistrationAddPictures.setSelectAllText(
				RegistrationAddPictures.areAllSelected());
		RegistrationAddPictures.numSelected++;
	} else {
		picture.fadedEl.hide();
		picture.checkedEl.hide();		
		RegistrationAddPictures.setSelectAllText(false);
		RegistrationAddPictures.numSelected--;
	}

	RegistrationAddPictures.footerEl.find('h2').text(
			RegistrationAddPictures.numSelected ?
					'Add ' + RegistrationAddPictures.numSelected :
					'Skip');
};

/**
 * Event handler. Called when the user first touches an image.
 */
RegistrationAddPictures.touchStart = function(e) {
	RegistrationAddPictures.touchStartY = RegistrationAddPictures.touchEndY =
			e.originalEvent.pageY;
};

/**
 * Event handler. Called when the user moves her finger. We intercept this event
 * to keep track of how far the user is moving her finger.
 */
RegistrationAddPictures.touchMove = function(e) {
	RegistrationAddPictures.touchEndY = e.originalEvent.pageY;
};

/**
 * Event handler. Called when the touch ends. Only toggle the select status of
 * the image if the user hasn't moved her finger by very much.
 */
RegistrationAddPictures.touchEnd = function(picture) {
	if (Math.abs(RegistrationAddPictures.touchEndY -
							 RegistrationAddPictures.touchStartY) < 5) {
		RegistrationAddPictures.toggleSelectedStatus(picture);
	}
};

/**
 * Event handler. Called when the user touches the footer button. Moves the
 * user to the second step of the registration flow.
 */
RegistrationAddPictures.touchFooterButton = function() {
	// "Upload" those pictures which are selected.
	var pictures = [];
	for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
		if (!picture.isSelected) {
			continue;
		}
		pictures.push(picture.asset);
	}
	PersonalLibrary.add(pictures);

//	localStorage.setItem('initialized', 1);
//	RegistrationCreateUser.show(true);
};