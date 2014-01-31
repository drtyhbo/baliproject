var AddPicturesView = {
	addPictures: null
};

/**
 * Makes the add pictures registration page the current page.
 */
AddPicturesView.show = function() {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			AddPicturesView.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change', '#add-pictures-view', {
		changeHash: false,
		showLoadMsg: false,
		transition: 'none'
	});
};

/**
 * Event handler. Called before the add pictures registration page is made
 * visible.
 */
AddPicturesView.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#add-pictures-view') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	var headerEl = ui.toPage.find('#header');
	$('<img></img>')
			.css({
				left: '5px',
				position: 'absolute',
				top: '5px'
			})
			.attr({
				height: 32,
				src: Images.getPath('icons/') + 'camera.png',
				width: 32
			})
			.appendTo(headerEl);

	AddPicturesView.addEl = ui.toPage.find('#add-button')
			.on(TOUCHEND, AddPicturesView.onAddPictures);

	var picturesEl = ui.toPage.find('#pictures')
			.empty();
	AddPicturesView.addPictures = new AddPictures(ui.toPage.width(),
			false, AddPicturesView.onSelectionChanged);
	AddPicturesView.addPictures.getEl()
			.appendTo(picturesEl);
	AddPicturesView.addPictures.toggleSelectAll();

	var homeBtn = ui.toPage.find('#home-btn')
			.on(TOUCHEND, function() {
				homeBtn.off(TOUCHEND, arguments.callee);
				FeedView.show();
			});
};

/**
 * Event handler. Called when the user clicks the 'Add' button.
 */
AddPicturesView.onAddPictures = function() {
	AddPicturesView.addPictures.removeSelected();
	AddPicturesView.onSelectionChanged(0);
	// "Upload" those pictures which are selected.
/*	PersonalLibrary.add(
			AddPicturesView.addPictures.getSelected());*/
};

/**
 * Event handler. Called when the user selects new pictures.
 */
AddPicturesView.onSelectionChanged = function(numSelected) {
	if (numSelected == 0) {
		AddPicturesView.addEl.text('Add');
	} else {
		AddPicturesView.addEl.text('Add ' + numSelected);
	}
};