var AddPicturesSelector = AddPictures.extend({
 init: function(width, scroller, assets) {
   this.assets = assets;
   this._super(width, scroller, false);
 },
 
 /**************************
  *
  * AddPictures overrides
  *
  **************************/
 
 getNumGroups: function() {
   return 1
 },
 
 getAssetsForGroup: function(groupIndex) {
   return this.assets;
 },
});

var AddPicturesView = {
    addPictures: null,
    pageEl: null,
    shown: false
};

/**
 * Makes the add pictures registration page the current page.
 */
AddPicturesView.show = function () {
  $.mobile.pageContainer.on('pagecontainershow',
      AddPicturesView.onShow);
  $.mobile.pageContainer.pagecontainer('change', '#add-pictures-view', {
    changeHash: true,
    showLoadMsg: false,
    transition: 'none'
  });
};

/**
 * Event handler. Called once the AddPicturesView is made visible.
 */
AddPicturesView.onShow = function (event, ui) {  
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);

  if (!AddPicturesView.shown) {
    var pageEl = $('#add-pictures-view');
    AddPicturesView.pageEl = pageEl;

    var homeBtn = pageEl.find('#home-btn')
  			.on(TOUCHSTART, function () {
  		    FeedView.show();
  			});
    var viewProfileBtn = pageEl.find('#profile-btn')
  			.on(TOUCHSTART, function () {
  		    LifeStreamView.show();
  			});

    var headerEl = pageEl.find('#header');
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

    AddPicturesView.addEl = pageEl.find('#add-button')
    		.on(TOUCHEND, AddPicturesView.onAddPictures);

    AddPicturesView.scroller = new Scroller(pageEl.find('#scrollable'));
  }
  AddPicturesView.shown = true;

  CameraRoll.load(function() {
    var assets = CameraRoll.getCameraRoll().filter(function(asset) {
      return !asset.isUploaded;
    });
    if (assets.length) {
      if (AddPicturesView.emptyUiContainer) {
        AddPicturesView.emptyUiContainer.remove();
      }
      var picturesEl = AddPicturesView.pageEl.find('#pictures').empty();

      var addPictures =
          new AddPicturesSelector(AddPicturesView.pageEl.width(),
            AddPicturesView.scroller, assets);
      addPictures.setSelectable(true, false,
          AddPicturesView.onSelectionChanged);
      addPictures.getEl().appendTo(picturesEl);
      addPictures.toggleSelectAll();
      AddPicturesView.addPictures = addPictures;
    } else {
      AddPicturesView.showEmptyUi();
    }
  });

  localStorage.setItem('current-view', ADD_PICTURES_VIEW_PAGE_IDX);
};

/**
 * Creates and returns a UI that can be shown when there are no photos left.
 */
AddPicturesView.showEmptyUi = function (e) {
  var emptyUiContainer = $('<div></div>')
      .css({
        color: '#ccc',
        fontSize: '20px',
        left: 0,
        marginTop: '-57px',
        position: 'absolute',
        right: 0,
        textAlign: 'center',
        top: '50%'
      })
      .appendTo(AddPicturesView.pageEl);
  $('<div></div>')
      .text('All photos added!')
      .appendTo(emptyUiContainer);
  $('<img></img>')
  		.attr({
  	    height: 64,
  	    src: Images.getPath('icons/') + 'camera-64.png',
  	    width: 64
  		})
		.appendTo(emptyUiContainer);
  $('<div></div>')
      .text('Take a new one :)')
      .appendTo(emptyUiContainer);

  AddPicturesView.emptyUiContainer = emptyUiContainer;
};


/**
 * Event handler. Called when the user clicks the 'Add' button.
 */
AddPicturesView.onAddPictures = function (e) {
  var assets = AddPicturesView.addPictures.getSelected();

  var uploadingNotification =
      AddPicturesView.pageEl.find('#uploading-notification');
  uploadingNotification.popup('open', {
    transition: 'pop'
  });

  PictureWidgets.ajaxAdd(assets, function() {
    Moments.load(function() {
      uploadingNotification.popup('close');
      AddPicturesView.addPictures.removeSelected(function () {
        AddPicturesView.onSelectionChanged(0);
        if (!AddPicturesView.addPictures.getNumPictures()) {
          AddPicturesView.showEmptyUi();
        }
      });
    });
  });
};

/**
 * Event handler. Called when the user selects new pictures.
 */
AddPicturesView.onSelectionChanged = function (numSelected) {
  if (numSelected == 0) {
    AddPicturesView.addEl.text('Add');
  } else {
    AddPicturesView.addEl.text('Add ' + numSelected);
  }
};