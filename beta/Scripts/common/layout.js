$.ajaxSetup({ cache: true })
var betaApp = angular.module('betaApp', ['ui.router', 'ui.bootstrap', 'ui.mask', 'bz.Directives'])
.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /state1
   // $urlRouterProvider.otherwise(beta.global.isAuthenticated ? "/home" : "/index");
    //$urlRouterProvider.otherwise(function ($injector, $location) {
    //    return '/partials/contacts.' + '.html';
    //});
    // Now set up the states
    $stateProvider
      .state('index', {
          url: "/index",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, "Home", "Index")
      })
      .state('home', {
          url: "^/home",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, "Home", "Home")
      })
      .state('register', {
          url: "^/register",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'Register'),
          controller: function ($scope, $http, userService) {
              registerCtrl.call(this, $scope, $http, userService);
          }
      })
      .state('login', {
          url: "^/login",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'Login'),
      })
      .state('roles', {
          url: "^/roles",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'RolesAdmin', 'Index'),
      })
    .state('users', {
        url: "/users",
        templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'UsersAdmin', 'List'),
        controller: function ($scope, userService) {
            usersCtrl.call(this, $scope, userService);
        }
    })
    .state('user', {
        url: "/user/:uid",
        templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'UsersAdmin', 'Details'),
        controller: function ($scope, $http, $stateParams, userService) {
            userCtrl.call(this, $scope, $http, userService, $stateParams.uid);
        }
    }).
    state('forgetPassword', {
        url: "/forgetPassword",
        templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'ForgotPassword'),
        controler: function ($scope) {
            pwdCtrl.call(this, $scope);
        }
    })
})
//.run(function ($rootScope) {
//    $rootScope.alerts = [
//    //{ type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
//    //{ type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//    ];
//    $rootScope.closeAlert = function (index) {
//        this.alerts.splice(index, 1);
//    };
//    $rootScope.$on("notify", function (event,args) {
//        $rootScope.$apply(function () {
//            $rootScope.alerts.push({ type: args.type, msg: args.msg });
//        });
//    });
//})
.controller("rootCtrl", function ($scope) {
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        this.alerts.splice(index, 1);
    };
    $scope.notify =function (type, msg) {
        this.$apply(function () {
            $scope.alerts.push({ type: type, msg: msg });
        });
    };
})
.controller("accountCtrl", function ($scope, $http, $rootScope) {
    $scope.getDealers = function (user) {
        $.getJSON(String.format("{0}Independent/GetUserDealers", beta.global.webroot), { user: user }).done(function (data) {
            $scope.$apply(function () {           
                $scope.data = { email: user, fullname: data.UserFullName, dealer: data.Dealers[0], dealers: data.Dealers };
            });
            beta.global.currentuser = $scope.data;
        })
    };
    $scope.status = {
        isopen: false
    };
    $scope.change = function (dealer) {
        this.data.dealer = dealer;
        this.status.isopen = false;
        $rootScope.$broadcast("dealerChanged", {
            dealer:dealer
        });
        beta.global.currentuser.dealer = dealer;
    }
    $scope.getDealers(beta.global.currentuser.email);
   
        //$scope.$watch('beta.global.currentuser.email', function (newvalue, oldvalue) {

        //});
});

betaApp.service('userService', function ($http, $q) {
    return ({
        getRoles: getRoles,
        getUserDealersAndRoles: getUserDealersAndRoles,
        getDealers: getDealers,
        getDealerUsers: getDealerUsers
    });
    function getDealerUsers(dealer) {
        var request = $http({
            method: "get",
            url: String.format("{0}GetDealerUsers/{1}",beta.global.webroot, dealer),
            params: {
                action: "get"
            }
        });

        return (request.then(handleSuccess, handleError));
    }
    function getRoles() {
        var request = $http({
            method: "get",
            url: String.format("{0}GetRoles", beta.global.webroot),
            params: {
                action: "get"
            }
        });

        return (request.then(handleSuccess, handleError));
    }
    function getUserDealersAndRoles(uid) {
        var request = $http({
            method: "get",
            url: String.format("{0}GetUserDealersAndRoles/{1}", beta.global.webroot, uid),
            params: {
                action: "get"
            }
        });

        return (request.then(handleSuccess, handleError));
    }
    function getDealers(dealer) {
        var request = $http({
            method: "get",
            url: String.format("{0}Dealers/{1}", beta.global.webroot, dealer),
            params: {
                action: "get"
            }
        });

        return (request.then(handleSuccess, handleError));
    }
    function handleError(response) {
        // The API response from the server should be returned in a
        // nomralized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            !angular.isObject(response.data) ||
            !response.data.message
            ) {

            return ($q.reject("An unknown error occurred."));

        }

        // Otherwise, use expected error message.
        return ($q.reject(response.data.message));

    }

    function handleSuccess(response) {

        return (response.data);

    }
});