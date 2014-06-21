var RegisterViewModel = function () {
    var _self = this;
    this.omit = ["modelName", "dealerName", "dealerObj", "confirmPassword","clearPassword"];
    this.modelName = 'RegisterViewModel';
    this.dealerName = korequire();
    this.dealerObj = korequire();
    this.dealer = koreset();
    this.email = korequire().extend({ email: true });
    this.phoneNumber = korequire().extend({phoneUS:true});
    this.userName = korequire();
    this.clearPassword = korequire().extend({ passwordComplexity: true });
    this.password = null;
    this.confirmPassword = korequire().extend({ 
        equal:{ message: 'Passwords do not match.', params: this.clearPassword }
    });
    //errors set in dealerName.subscribe is reset
    this.dealerNameValidator = function () {
        _self.dealer(_self.dealerObj() && _self.dealerObj().Name == this.dealerName() ? _self.dealerObj().DealerID : null);
        if (_self.dealer() == null) 
            ko.validation.setError(_self.dealerName, "Not found!");        
        else
            ko.validation.clearError(_self.dealerName);
    };
    this.submit = function (form) {
        if (this.errors().length == 0) {
            this.password = AESencrypt(this.clearPassword());
            $.post(String.format("/Account/Register"), { data: submitData(this) }).done(function (data) {
                //$.post(String.format("/Account/SendRegisterEmail"), { uid: data });
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

//# sourceURL=bz.account.js