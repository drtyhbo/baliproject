var AddPicturesView = {};

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

	var homeBtn = ui.toPage.find('#home-btn')
			.on(TOUCHEND, function() {
				homeBtn.off(TOUCHEND, arguments.callee);
				FeedView.show();
			});
};