function SendVerifyCode() {
    $.post(String.format('{0}Account/SendCode', beta.global.webroot), {}).done(function () {
        showNotify('Please check your email!');
    });
}
//# sourceURL=bz.sendVeifyCode.js