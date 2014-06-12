function SendVerifyCode() {
    $.post('/Account/SendCode', {}).done(function () {
        showNotify('Please check your email!');
    });
}
//# sourceURL=bz.sendVeifyCode.js