$(document).ready(function() {
	$(document.body).show();

	localStorage.setItem('initialized', 0);
	if (!localStorage.getItem('initialized') ||
      localStorage.getItem('initialized') < 2) {
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