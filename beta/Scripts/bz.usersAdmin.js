function usersCtrl($scope, $http) {
    $http.get(String.format("{0}GetDealerUsers/{1}",beta.global.webroot, beta.global.currentuser.dealer.DealerID)).then(function (res) {
         $scope.users = res.data;
    });
}
function userCtrl($scope, $http, uid) {
    if (hasNoValue(beta.global.roles)) {
        $http.get(String.format("{0}GetRoles", beta.global.webroot)).then(function (res) {
            beta.global.roles = res.data;
        });
    }
    $http.get(String.format("{0}GetUserDealersAndRoles/{1}", beta.global.webroot, uid).then(function (res) {
        $scope.data = res.data;
    }));
}
//# sourceURL=bz.usersAdmin.js