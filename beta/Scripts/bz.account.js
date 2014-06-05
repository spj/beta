var RegisterViewModel = function () {
    var _self = this;
    this.dealer = korequire();
    this.email = korequire().extend({ email: true });
    this.phoneNumber = korequire().extend({phoneUS:true});
    this.userName = korequire();
    this.password = korequire().extend({passwordComplexity:true});
    this.confirmPassword = korequire().extend({ 
        equal:{ message: 'Passwords do not match.', params: this.password }
    });
    this.errors = ko.validation.group(this);
    this.submit = function (form) {
        if (this.errors().length == 0) {
            $.post(String.format("/Account/Register"), { data: ko.toJSON(this) }).done(function () {

            });
        } else {
            this.errors.showAllMessages();
        }
    };
    this.reset = function (data, event) {
        resetViewModel(this, event);
    };

}

function loadRegister() {
    gotoController('Account', 'Register').done(function () {
        ko.applyBindings(new RegisterViewModel(), $('#main>form')[0]);
    });

}
//# sourceURL=bz.account.js