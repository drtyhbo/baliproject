$(document).ready(function() {
	$(document.body).show();

	if (localStorage.getItem('initialized') || 0 < 2) {
		setTimeout(function() {
			if (localStorage.getItem('initialized') == 1) {
				RegistrationCreateUser.show(false);
			} else {
				RegistrationAddPictures.show(false);
			}
		}, 100);
	} else {
//    $.mobile.pageContainer.pagecontainer('change', 'user-profile.html');
	}
});