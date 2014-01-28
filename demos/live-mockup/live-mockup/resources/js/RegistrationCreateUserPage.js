var RegistrationCreateUserPage = {
	emailEl: null,
	footerEl: null,
	nameEl: null,
	passwordEl: null
};

RegistrationCreateUserPage.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationCreateUserPage.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change',
			'#registration-create-user', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

RegistrationCreateUserPage.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#registration-create-user') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	RegistrationCreateUserPage.emailEl = ui.toPage.find('#create-user-email')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);
	RegistrationCreateUserPage.nameEl = ui.toPage.find('#create-user-name')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);
	RegistrationCreateUserPage.passwordEl = ui.toPage.find('#create-user-password')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);

	RegistrationCreateUserPage.footerEl = ui.toPage.find('#create-user-footer')
			.click(RegistrationCreateUserPage.clickFooterButton);
};

RegistrationCreateUserPage.clickFooterButton = function() {
	if (!RegistrationCreateUserPage.nameEl.val()) {
		RegistrationCreateUserPage.nameEl.focus();
	} else if (!RegistrationCreateUserPage.emailEl.val()) {
		RegistrationCreateUserPage.emailEl.focus();
	} else if (!RegistrationCreateUserPage.passwordEl.val()) {
		RegistrationCreateUserPage.passwordEl.focus();
	} else {
		localStorage.setItem('name', RegistrationCreateUserPage.nameEl.val());
		localStorage.setItem('email', RegistrationCreateUserPage.emailEl.val());
		localStorage.setItem('password', RegistrationCreateUserPage.passwordEl.val());
	}
};

RegistrationCreateUserPage.focusInput = function() {
	RegistrationCreateUserPage.footerEl.hide();
};

RegistrationCreateUserPage.blurInput = function() {
	RegistrationCreateUserPage.footerEl.show();
};