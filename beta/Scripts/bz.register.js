﻿var RegisterViewModel = function () {
    var _self = this;
    this.omit = ["modelName", "dealerName", "dealerObj", "confirmPassword", "clearPassword"];
    this.dealerName = korequire();
    this.dealerObj = korequire();
    this.dealer = koreset();
    this.email = korequire().extend({ email: true });
    this.phoneNumber = korequire().extend({ phoneUS: true });
    this.userName = korequire().extend({required:true, pattern: '^[0-9a-zA-Z\ \]+$' });
    this.clearPassword = korequire().extend({ passwordComplexity: true });
    this.password = null;
    this.confirmPassword = korequire().extend({
        equal: { message: 'Passwords do not match.', params: this.clearPassword }
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
        this.errors = ko.validation.group(this);
        if (this.isValid()) {
            this.password = AESencrypt(this.clearPassword());
            $.post(String.format("{0}Account/Register", beta.global.webroot), { data: submitData(this) }).done(function (data) {
                if (data)
                    showNotify(data);
                else {
                    $('#main').html("<strong>A verify code has been send to your email.</strong>");
                    _self.reset();                   
                }
            });
        } 
    };
    this.reset = function (data, event) {
        resetViewModel(this, event);
    };

}
//# sourceURL=bz.register.js