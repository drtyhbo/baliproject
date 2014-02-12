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

	var viewProfileBtn = ui.toPage.find('#profile-btn')
      .on(TOUCHSTART, function () {
          LifeStreamView.show();
      });
        
  var scroller = new Scroller($('#scrollable'));
  var addPictures =
      new AddPictures(ui.toPage.width(), CameraRoll.getCameraRoll(), scroller);
  addPictures.setSelectable(true, true,
      RegistrationAddPicturesPage.onSelectionChanged);
  addPictures.getEl()
			.appendTo(ui.toPage.find('#pictures'));
	RegistrationAddPicturesPage.addPictures = addPictures;
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
RegistrationAddPicturesPage.touchFooterButton = function(e) {
  e.preventDefault();
  
  var assets = RegistrationAddPicturesPage.addPictures.getSelected();

	// "Upload" those pictures which are selected.
	PersonalLibrary.add(assets);
    PictureWidgets.ajaxAdd(assets, function() {
        if (!Users.getCurrentUser() || !Users.getCurrentUser().name) {
            RegistrationCreateUserPage.show(true);
        } else {
            FeedView.show(true);
        }
    });
};
