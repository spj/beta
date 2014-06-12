var RegisterViewModel = function () {
    var _self = this;
    this.omit = ["modelName", "dealerName", "dealerObj", "confirmPassword"];
    this.modelName = 'RegisterViewModel';
    this.dealerName = korequire();
    this.dealerObj = korequire();
    this.dealer = koreset();
    this.email = korequire().extend({ email: true });
    this.phoneNumber = korequire().extend({phoneUS:true});
    this.userName = korequire();
    this.password = korequire().extend({passwordComplexity:true});
    this.confirmPassword = korequire().extend({ 
        equal:{ message: 'Passwords do not match.', params: this.password }
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
            $.post(String.format("/Account/Register"), { data: submitData(this) }).done(function (data) {
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

var _typeaheadObjects = [];
var dealerTypeaheadHelper = function () {
    return {
        option: {
            minLength: 4,
            source: function (query, process) {
                return $.getJSON(String.format("/Independent/DealersForRegister/{0}", query)).done(function (data) {
                    _typeaheadObjects = data;
                    process(getTypeAheadFromJson(data, 'Name'));
                });
            }
            ,
            updater: function (dealer) {
                var _d = _(_typeaheadObjects).find(function (d) {
                    return d.Name == dealer;
                });
                var _model = ko.dataFor($('#main form')[0]);
                _model.dealerObj(_d);
                return _d.Name;
            }
        }
    };
};

//# sourceURL=bz.account.js