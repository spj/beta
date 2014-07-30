function registerCtrl($scope, $http) {
    $scope.submitData = ["dealer", "userName", "email", "phoneNumber", "password"];
    $scope.phoneChecker = function (value) {        
        return null;
    }
    $scope.getDealers = function (val) {
        return $http.get(String.format("{0}Dealers/{1}", beta.global.webroot, val)).then(function (res) {
            return res.data;
        });
    };
    $scope.submit = function () {
        this.password = AESencrypt(this.clearPassword);
        $.post(String.format("{0}Account/Register", beta.global.webroot), { data: submitData(this.data) }).done(function (data) {

        });
    };
    $scope.reset = function () {
        $scope = {};
    }
};
//# sourceURL=bz.register.js