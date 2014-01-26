var RegistrationCreateUser = {
	emailEl: null,
	nameEl: null,
	passwordEl: null
};

RegistrationCreateUser.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationCreateUser.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change',
			'#registration-create-user', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

RegistrationCreateUser.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#registration-create-user') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	RegistrationCreateUser.emailEl = ui.toPage.find('#create-user-email');
	RegistrationCreateUser.nameEl = ui.toPage.find('#create-user-name');
	RegistrationCreateUser.passwordEl = ui.toPage.find('#create-user-password');

	ui.toPage.find('#create-user-footer').click(
			RegistrationCreateUser.clickFooterButton);
};

RegistrationCreateUser.clickFooterButton = function() {
	if (!RegistrationCreateUser.nameEl.val()) {
		RegistrationCreateUser.nameEl.focus();
	} else if (!RegistrationCreateUser.emailEl.val()) {
		RegistrationCreateUser.emailEl.focus();
	} else if (!RegistrationCreateUser.passwordEl.val()) {
		RegistrationCreateUser.passwordEl.focus();
	} else {
		localStorage.setItem('name', RegistrationCreateUser.nameEl.val());
		localStorage.setItem('email', RegistrationCreateUser.emailEl.val());
		localStorage.setItem('password', RegistrationCreateUser.passwordEl.val());
	}
};