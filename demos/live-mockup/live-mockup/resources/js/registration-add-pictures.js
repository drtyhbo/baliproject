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

RegistrationAddPictures.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationAddPictures.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change', '#registration-add-pictures', {
		changeHash: false,
		showLoadMsg: false,
		transition: animate ? 'slide' : 'none'
	});
};

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
			.on('touchstart', RegistrationAddPictures.clickFooterButton);
	RegistrationAddPictures.selectAllEl = ui.toPage
			.find('#select-all')
			.on('touchstart', RegistrationAddPictures.selectAll);

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
			selected: false,
			asset: asset,
			fadedEl: fadedEl,
			checkedEl: checkedEl
		};		
		RegistrationAddPictures.pictures.push(picture);

		thumbnailEl.on('touchstart', RegistrationAddPictures.touchStart);
		thumbnailEl.on('touchmove', RegistrationAddPictures.touchMove);
		thumbnailEl.on('touchend',
				RegistrationAddPictures.touchEnd.bind(this, picture));
	}
	
	RegistrationAddPictures.selectAll();
};

RegistrationAddPictures.areAllSelected = function() {
	for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
		if (!picture.selected) {
			return false;
		}
	}
	return true;
};

RegistrationAddPictures.setSelectAllText = function(areAllSelected) {
	RegistrationAddPictures.selectAllEl.text(
			areAllSelected ? 'Select none' : 'Select all');
};

RegistrationAddPictures.selectAll = function(e) {
	if (RegistrationAddPictures.areAllSelected()) {
		for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
			RegistrationAddPictures.toggleSelectedStatus(picture);
		}
		RegistrationAddPictures.setSelectAllText(false);
		RegistrationAddPictures.numSelected = 0;
	} else {
		for (var i = 0, picture; picture = RegistrationAddPictures.pictures[i]; i++) {
			if (!picture.selected) {
				RegistrationAddPictures.toggleSelectedStatus(picture);
			}
		}
		RegistrationAddPictures.setSelectAllText(true);
		RegistrationAddPictures.numSelected = RegistrationAddPictures.pictures.length;
	}
};

RegistrationAddPictures.touchStart = function(e) {
	RegistrationAddPictures.touchStartY = RegistrationAddPictures.touchEndY =
			e.originalEvent.pageY;
};

RegistrationAddPictures.touchMove = function(e) {
	RegistrationAddPictures.touchEndY = e.originalEvent.pageY;
};

RegistrationAddPictures.touchEnd = function(picture) {
	if (Math.abs(RegistrationAddPictures.touchEndY -
							 RegistrationAddPictures.touchStartY) < 5) {
		RegistrationAddPictures.toggleSelectedStatus(picture);
	}
};

RegistrationAddPictures.toggleSelectedStatus = function(picture) {
	var isSelected = picture.selected;
	picture.selected = !picture.selected;

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

RegistrationAddPictures.clickFooterButton = function() {
	localStorage.setItem('initialized', 1);
	RegistrationCreateUser.show(true);
};