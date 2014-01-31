var RegistrationAddPicturesPage = {
	addPictures: null,
	footerEl: null
};

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

	RegistrationAddPicturesPage.footerEl = ui.toPage
			.find('#add-pictures-footer')
			.on(TOUCHSTART, RegistrationAddPicturesPage.touchFooterButton);

	RegistrationAddPicturesPage.addPictures = new AddPictures(ui.toPage.width(), true,
			RegistrationAddPicturesPage.onSelectionChanged);
	RegistrationAddPicturesPage.addPictures.getEl()
			.appendTo(ui.toPage.find('#pictures'));
};

/**
 * Event handler. Called when the user selects new pictures.
 */
RegistrationAddPicturesPage.onSelectionChanged = function(numSelected) {
	RegistrationAddPicturesPage.footerEl.find('h2').text(
			numSelected ?
					'Add ' + numSelected :
					'Skip');
};

/**
 * Event handler. Called when the user touches the footer button. Moves the
 * user to the second step of the registration flow.
 */
RegistrationAddPicturesPage.touchFooterButton = function() {
	// "Upload" those pictures which are selected.
	PersonalLibrary.add(
			RegistrationAddPicturesPage.addPictures.getSelected());
//	RegistrationCreateUserPage.show(true);
  FeedView.show(true);
};
