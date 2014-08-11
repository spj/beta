betaApp.controller("verifyCodeCtrl", function ($scope) {
    $scope.SendVerifyCode = function () {
        $.post(String.format('{0}Account/SendCode', beta.global.webroot), {}).done(function () {
            $scope.notify('success','Please check your email!');
        });
    }
});
//# sourceURL=bz.sendVeifyCode.js