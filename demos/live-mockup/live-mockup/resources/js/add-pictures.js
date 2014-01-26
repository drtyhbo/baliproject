var AddPictures = {};

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

  var pictures = ui.toPage.find('#pictures');
	var pictureDimension = (ui.toPage.width() - 35 - 16 * 3) / 4;

	var cameraRoll = CameraRoll.getCameraRoll();
	for (var i = 0, asset; asset = cameraRoll[i]; i++) {
		var thumbnail = $('<span></span>')
        .css('background-image', 'url(' + CameraRoll.getThumb(asset) + ')')
        .css('background-size', 'cover')
        .css('display', 'inline-block')
				.css('width', pictureDimension + 'px')
				.css('height', pictureDimension + 'px')
        .css('margin-bottom', '16px')
        .css('margin-right', i % 4 != 3 ? '16px' : 0)
				.appendTo(pictures);
	}
};