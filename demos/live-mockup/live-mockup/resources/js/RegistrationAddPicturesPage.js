var RegistrationAddPicturesPage = {
	footerEl: null,
	numSelected: 0,
	pictures: null,
	selectAllEl: null,
	touchStartY: 0,
	touchEndY: 0
};

RegistrationAddPicturesPage.PAGE_SPACING = 35;
RegistrationAddPicturesPage.NUM_COLUMNS = 3;
RegistrationAddPicturesPage.SPACING = 5;

/**
 * Makes the add pictures registration page the current page.
 */
RegistrationAddPicturesPage.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationAddPicturesPage.beforeTransition);
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
RegistrationAddPicturesPage.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#registration-add-pictures') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	RegistrationAddPicturesPage.pictures = [];

	RegistrationAddPicturesPage.numSelected = 0;
	RegistrationAddPicturesPage.footerEl = ui.toPage
			.find('#add-pictures-footer')
			.on(TOUCHSTART, RegistrationAddPicturesPage.touchFooterButton);
	RegistrationAddPicturesPage.selectAllEl = ui.toPage
			.find('#select-all')
			.on(TOUCHSTART, RegistrationAddPicturesPage.toggleSelectAll);

  var pictures = ui.toPage.find('#pictures');
	var pictureDimension = (ui.toPage.width() -
			RegistrationAddPicturesPage.PAGE_SPACING -
			RegistrationAddPicturesPage.SPACING *
					(RegistrationAddPicturesPage.NUM_COLUMNS - 1)) /
			RegistrationAddPicturesPage.NUM_COLUMNS;

	var cameraRoll = CameraRoll.getCameraRoll();
	for (var i = 0, asset; asset = cameraRoll[i]; i++) {
		var thumbnailEl = $('<span></span>')
        .css({
					display: 'inline-block',
					height: pictureDimension + 'px',
					marginBottom: '5px',
					marginLeft:
							i % RegistrationAddPicturesPage.NUM_COLUMNS != 0 ?
									RegistrationAddPicturesPage.SPACING + 'px' :
									0,
					position: 'relative',
				  width: pictureDimension + 'px'
				})
				.appendTo(pictures);

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
		RegistrationAddPicturesPage.pictures.push(picture);

		thumbnailEl.on(TOUCHSTART, RegistrationAddPicturesPage.touchStart);
		thumbnailEl.on('touchmove', RegistrationAddPicturesPage.touchMove);
		thumbnailEl.on(TOUCHEND,
				RegistrationAddPicturesPage.touchEnd.bind(this, picture));
	}
	
	RegistrationAddPicturesPage.toggleSelectAll();
};

/**
 * Returns true if all the pictures are selected.
 */
RegistrationAddPicturesPage.areAllSelected = function() {
	for (var i = 0, picture; picture = RegistrationAddPicturesPage.pictures[i]; i++) {
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
RegistrationAddPicturesPage.setSelectAllText = function(areAllSelected) {
	RegistrationAddPicturesPage.selectAllEl.text(
			areAllSelected ? 'Select none' : 'Select all');
};

/**
 * Toggles the selected status of the images. When:
 *   All are already selected: Unselects all of them.
 *   Some are unselected: Selects all of them.
 */
RegistrationAddPicturesPage.toggleSelectAll = function(e) {
	if (RegistrationAddPicturesPage.areAllSelected()) {
		for (var i = 0, picture; picture = RegistrationAddPicturesPage.pictures[i]; i++) {
			RegistrationAddPicturesPage.toggleSelectedStatus(picture);
		}
		RegistrationAddPicturesPage.setSelectAllText(false);
		RegistrationAddPicturesPage.numSelected = 0;
	} else {
		for (var i = 0, picture; picture = RegistrationAddPicturesPage.pictures[i]; i++) {
			if (!picture.isSelected) {
				RegistrationAddPicturesPage.toggleSelectedStatus(picture);
			}
		}
		RegistrationAddPicturesPage.setSelectAllText(true);
		RegistrationAddPicturesPage.numSelected = RegistrationAddPicturesPage.pictures.length;
	}
};

/**
 * Toggles the selected status of an individual image.
 */
RegistrationAddPicturesPage.toggleSelectedStatus = function(picture) {
	var isSelected = picture.isSelected;
	picture.isSelected = !picture.isSelected;

	if (!isSelected) {
		picture.fadedEl.show();
		picture.checkedEl.show();
		RegistrationAddPicturesPage.setSelectAllText(
				RegistrationAddPicturesPage.areAllSelected());
		RegistrationAddPicturesPage.numSelected++;
	} else {
		picture.fadedEl.hide();
		picture.checkedEl.hide();		
		RegistrationAddPicturesPage.setSelectAllText(false);
		RegistrationAddPicturesPage.numSelected--;
	}

	RegistrationAddPicturesPage.footerEl.find('h2').text(
			RegistrationAddPicturesPage.numSelected ?
					'Add ' + RegistrationAddPicturesPage.numSelected :
					'Skip');
};

/**
 * Event handler. Called when the user first touches an image.
 */
RegistrationAddPicturesPage.touchStart = function(e) {
	RegistrationAddPicturesPage.touchStartY = RegistrationAddPicturesPage.touchEndY =
			e.originalEvent.pageY;
};

/**
 * Event handler. Called when the user moves her finger. We intercept this event
 * to keep track of how far the user is moving her finger.
 */
RegistrationAddPicturesPage.touchMove = function(e) {
	RegistrationAddPicturesPage.touchEndY = e.originalEvent.pageY;
};

/**
 * Event handler. Called when the touch ends. Only toggle the select status of
 * the image if the user hasn't moved her finger by very much.
 */
RegistrationAddPicturesPage.touchEnd = function(picture) {
	if (Math.abs(RegistrationAddPicturesPage.touchEndY -
							 RegistrationAddPicturesPage.touchStartY) < 5) {
		RegistrationAddPicturesPage.toggleSelectedStatus(picture);
	}
};

/**
 * Event handler. Called when the user touches the footer button. Moves the
 * user to the second step of the registration flow.
 */
RegistrationAddPicturesPage.touchFooterButton = function() {
	// "Upload" those pictures which are selected.
	var pictures = [];
	var pictureNumbers = [];
	for (var i = 0, picture; picture = RegistrationAddPicturesPage.pictures[i]; i++) {
		if (!picture.isSelected) {
			continue;
		}
		pictures.push(picture.asset);
		pictureNumbers.push(picture.asset.num);
	}
	PersonalLibrary.add(pictures);

	localStorage.setItem('registration-pictures', pictureNumbers);
	RegistrationCreateUserPage.show(true);
};
