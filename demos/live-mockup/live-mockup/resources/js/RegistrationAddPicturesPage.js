var RegistrationPictureViewer = AddPictures.extend({
 init: function(width, scroller, assets) {
   this.assets = assets;
   this._super(width, scroller, false);
 },
 
 getNumGroups: function() {
   return 1
 },
 
 getAssetsForGroup: function(groupIndex) {
   return this.assets;
 },
});

var RegistrationAddPicturesPage = {
	pictureViewer: null,
	footerEl: null
};

/**
 * Makes the add pictures registration page the current page.
 */
RegistrationAddPicturesPage.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainershow',
			RegistrationAddPicturesPage.onShow);
	$.mobile.pageContainer.pagecontainer('change', '#registration-add-pictures', {
		changeHash: false,
		showLoadMsg: false,
		transition: animate ? 'slide' : 'none'
	});
};

/**
 * Event handler. Called once the RegistrationAddPicturesPage is made visible.
 */
RegistrationAddPicturesPage.onShow = function(event, ui) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);

  var pageEl = $('#registration-add-pictures');

	RegistrationAddPicturesPage.footerEl = pageEl
			.find('#add-pictures-footer')
			.on(TOUCHSTART, RegistrationAddPicturesPage.touchFooterButton);

	var viewProfileBtn = pageEl.find('#profile-btn')
      .on(TOUCHSTART, function () {
        LifeStreamView.show();
      });
        
  var scroller = new Scroller($('#scrollable'));
  var pictureViewer =
      new RegistrationPictureViewer(pageEl.width(), scroller,
          CameraRoll.getCameraRoll());
  pictureViewer.setSelectable(true, true,
      RegistrationAddPicturesPage.onSelectionChanged);
  pictureViewer.getEl()
			.appendTo(pageEl.find('#pictures'));
	RegistrationAddPicturesPage.pictureViewer = pictureViewer;
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
  
  var assets = RegistrationAddPicturesPage.pictureViewer.getSelected();
	PersonalLibrary.add(assets);
  PictureWidgets.ajaxAdd(assets, function() {
    if (!Users.getCurrentUser() || !Users.getCurrentUser().name) {
      RegistrationCreateUserPage.show(true);
    } else {
      FeedView.show(true);
    }
  });
};