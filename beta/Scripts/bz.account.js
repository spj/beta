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

function forgotPassword() {
    var _url = String.format("/{0}/GetView/{1}", 'Account', 'ForgotPassword');
    var _container = $('#main');
    var _prefix = "ForgotPasswordView"; _modelName = _prefix + "Model";
    loadTemplate({ url: _url, $container: _container, element: _prefix, modelName: _modelName });
}

//# sourceURL=bz.account.js