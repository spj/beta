var RegisterViewModel = function () {
    var _self = this;
    this.modelName = 'RegisterViewModel';
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
            $.post(String.format("/Account/Register"), { data: ko.toJSON(this) }).done(function (data) {               
                $.post(String.format("/Account/SendRegisterEmail"), { uid: data });
                _self.reset();
                showNotify('Please check your email!');
            }).fail(function (xhr, status, error) {
                showNotify(xhr.responseText);
            });
        } else {
            this.errors.showAllMessages();
        }
    };
    this.reset = function (data, event) {
        resetViewModel(this, event);
    };

}

var ForgotPasswordViewModel = function () {
    var _self = this;
    this.modelName = 'ForgotPasswordViewModel';
    this.email = korequire().extend({ email: true });
    this.errors = ko.validation.group(this);
    this.submit = function (form) {
        if (this.errors().length == 0) {
            $.post(String.format("/Account/ForgotPassword"), { email: this.email() })
            .done(function (data) {
                showNotify(data);
            }).fail(function (xhr, status, error) {
                showNotify(xhr.responseText);
            });
        } else {
            this.errors.showAllMessages();
        }
    };
}
function loadRegister() {
    loadView('Account', 'Register', new RegisterViewModel());
}

function forgotPassword() {
    loadView('Account', 'ForgotPassword', new ForgotPasswordViewModel());
}

function SendVerifyCode() {
    $.post('@Url.Action("SendCode")', {}).done(function () {
        showNotify('Please check your email!');
    });
}
//# sourceURL=bz.account.js