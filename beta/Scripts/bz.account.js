var ForgotPasswordViewModel = function () {
    var _self = this;
    this.modelName = 'ForgotPasswordViewModel';
    this.email = korequire().extend({ email: true });
    this.errors = ko.validation.group(this);
    this.submit = function (form) {
        this.errors = ko.validation.group(this);
        if (this.isValid()) {
            $.post(String.format("{0}Account/ForgotPassword", beta.global.webroot), { email: this.email() })
            .done(function (data) {
                showNotify(data);
            }).fail(function (xhr, status, error) {
                showNotify(xhr.responseText);
            });
        } 
    };
}

function forgotPassword() {
    var _url = String.format("{0}{1}/GetView/{2}", beta.global.webroot,'Account', 'ForgotPassword');
    var _container = '#main';
    var _prefix = "ForgotPasswordView"; _modelName = _prefix + "Model";
    loadTemplate({ url: _url, ontainer: _container, element: _prefix, modelName: _modelName, historyUrl: String.format("{0}ForgotPassword", beta.global.webroot) });
}

//# sourceURL=bz.account.js