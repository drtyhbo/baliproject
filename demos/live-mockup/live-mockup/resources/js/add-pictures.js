var AddPictures = {
	footerEl: null,
	numSelected: 0,
	pictures: null,
	selectAllEl: null
};

AddPictures.PAGE_SPACING = 35;
AddPictures.NUM_COLUMNS = 3;
AddPictures.SPACING = 5;

AddPictures.show = function() {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			AddPictures.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change', '#add-pictures', {
		changeHash: false,
		showLoadMsg: false,
		transition: 'none'
	});
};

AddPictures.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#add-pictures') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	AddPictures.pictures = [];

	AddPictures.numSelected = 0;
	AddPictures.footerEl = ui.toPage
			.find('#add-pictures-footer')
			.on('click', AddPictures.clickFooterButton);
	AddPictures.selectAllEl = ui.toPage
			.find('#select-all')
			.on('click', AddPictures.selectAll);

  var pictures = ui.toPage.find('#pictures');
	var pictureDimension = (ui.toPage.width() - AddPictures.PAGE_SPACING -
			AddPictures.SPACING * (AddPictures.NUM_COLUMNS - 1)) /
			AddPictures.NUM_COLUMNS;

	var cameraRoll = CameraRoll.getCameraRoll();
	for (var i = 0, asset; asset = cameraRoll[i]; i++) {
		var thumbnailEl = $('<span></span>')
        .css('display', 'inline-block')
				.css('width', pictureDimension + 'px')
				.css('height', pictureDimension + 'px')
		    .css('margin-bottom', '5px')
		    .css('margin-left',
						i % AddPictures.NUM_COLUMNS != 0 ?
								AddPictures.SPACING + 'px' :
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
		AddPictures.pictures.push(picture);

		thumbnailEl.on('mousedown',
				AddPictures.toggleSelectedStatus.bind(this, picture));
	}
};

AddPictures.areAllSelected = function() {
	for (var i = 0, picture; picture = AddPictures.pictures[i]; i++) {
		if (!picture.selected) {
			return false;
		}
	}
	return true;
};

AddPictures.setSelectAllText = function(areAllSelected) {
	AddPictures.selectAllEl.text(areAllSelected ? 'Select none' : 'Select all');
};

AddPictures.selectAll = function(e) {
	if (AddPictures.areAllSelected()) {
		for (var i = 0, picture; picture = AddPictures.pictures[i]; i++) {
			AddPictures.toggleSelectedStatus(picture);
		}
		AddPictures.setSelectAllText(false);
		AddPictures.numSelected = 0;
	} else {
		for (var i = 0, picture; picture = AddPictures.pictures[i]; i++) {
			if (!picture.selected) {
				AddPictures.toggleSelectedStatus(picture);
			}
		}
		AddPictures.setSelectAllText(true);
		AddPictures.numSelected = AddPictures.pictures.length;
	}
};

AddPictures.toggleSelectedStatus = function(picture) {
	var isSelected = picture.selected;
	picture.selected = !picture.selected;

	if (!isSelected) {
		picture.fadedEl.show();
		picture.checkedEl.show();
		AddPictures.setSelectAllText(AddPictures.areAllSelected());
		AddPictures.numSelected++;
	} else {
		picture.fadedEl.hide();
		picture.checkedEl.hide();		
		AddPictures.setSelectAllText(false);
		AddPictures.numSelected--;
	}

	AddPictures.footerEl.find('h2').text(AddPictures.numSelected ?
			('Add ' + AddPictures.numSelected) :
			'Skip');
};

AddPictures.clickFooterButton = function() {
	alert ('here');
};