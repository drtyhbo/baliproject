var RegistrationAddPictures = {
	footerEl: null,
	numSelected: 0,
	pictures: null,
	selectAllEl: null
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
	var pictureDimension = (ui.toPage.width() - RegistrationAddPictures.PAGE_SPACING -
			RegistrationAddPictures.SPACING * (RegistrationAddPictures.NUM_COLUMNS - 1)) /
			RegistrationAddPictures.NUM_COLUMNS;

	var cameraRoll = CameraRoll.getCameraRoll();
	for (var i = 0, asset; asset = cameraRoll[i]; i++) {
		var thumbnailEl = $('<span></span>')
        .css('display', 'inline-block')
				.css('width', pictureDimension + 'px')
				.css('height', pictureDimension + 'px')
		    .css('margin-bottom', '5px')
		    .css('margin-left',
						i % RegistrationAddPictures.NUM_COLUMNS != 0 ?
								RegistrationAddPictures.SPACING + 'px' :
								0)
				.css('position', 'relative')
				.appendTo(pictures);

		var imageEl = $('<span></span>')
        .css('background-image', 'url(' + CameraRoll.getThumb(asset) + ')')
        .css('background-size', 'cover')
				.css('display', 'inline-block')
				.css('height', '100%')
				.css('left', 0)
				.css('position', 'absolute')
				.css('top', 0)
				.css('width', '100%')
				.appendTo(thumbnailEl);

		var fadedEl = $('<span></span>')
        .css('background', '#ffffff')
				.css('display', 'none')
				.css('height', '100%')
				.css('left', 0)
				.css('opacity', 0.35)
				.css('position', 'absolute')
				.css('top', 0)
				.css('width', '100%')
				.appendTo(thumbnailEl);

		var checkedEl = $('<img></img>')
				.css('bottom', 5)
				.css('display', 'none')
				.css('position', 'absolute')
				.css('right', 5)
				.attr('src', Images.getPath() + 'check.png')
				.appendTo(thumbnailEl);

		var picture = {
			selected: false,
			asset: asset,
			fadedEl: fadedEl,
			checkedEl: checkedEl
		};		
		RegistrationAddPictures.pictures.push(picture);

		thumbnailEl.on('touchstart',
				RegistrationAddPictures.toggleSelectedStatus.bind(this, picture));
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
	RegistrationAddPictures.selectAllEl.text(areAllSelected ? 'Select none' : 'Select all');
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

RegistrationAddPictures.toggleSelectedStatus = function(picture) {
	var isSelected = picture.selected;
	picture.selected = !picture.selected;

	if (!isSelected) {
		picture.fadedEl.show();
		picture.checkedEl.show();
		RegistrationAddPictures.setSelectAllText(RegistrationAddPictures.areAllSelected());
		RegistrationAddPictures.numSelected++;
	} else {
		picture.fadedEl.hide();
		picture.checkedEl.hide();		
		RegistrationAddPictures.setSelectAllText(false);
		RegistrationAddPictures.numSelected--;
	}

	RegistrationAddPictures.footerEl.find('h2').text(RegistrationAddPictures.numSelected ?
			('Add ' + RegistrationAddPictures.numSelected) :
			'Skip');
};

RegistrationAddPictures.clickFooterButton = function() {
	localStorage.setItem('initialized', 1);
	RegistrationCreateUser.show(true);
};