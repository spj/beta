function usersCtrl($scope, userService) {
    $scope.getusers = function (dealer) {
        userService.getDealerUsers(dealer).then(function (users) {
            $scope.users = users;
        })
    };
    $scope.$on("dealerChanged", function (event, args) {
        $scope.getusers(args.dealer.DealerID);
    });
    $scope.getusers(beta.global.currentuser.dealer.DealerID);
}

function userCtrl($scope, $http, userService, uid) {
    $scope.orig = {};
    if (beta.global.roles)
        $scope.roles = beta.global.roles;
    else{
        userService.getRoles().then(function (roles) {
            beta.global.roles = roles;
            $scope.roles = roles;
        });
    }
       
    var  _addedRoles = [], _deledRoles = [], _addedDealers = [], _deledDealers = [];
    userService.getUserDealersAndRoles(uid).then(function (data) {
        $scope.data = data;
        angular.forEach($scope.roles, function (r) {
            if ($scope.data.roles)
                r.selected = $scope.data.roles.indexOf(r.Id)>-1;
            else
                r.selected = false;
        });
        $scope.orig = angular.copy($scope.data);
    });
    $scope.getDealers = function (dealer) {
        return userService.getDealers(dealer);
    };
    $scope.rolecheck = function (r) {
        if (r.selected) {
            this.data.roles = _.without(this.data.roles, r.Id);
            if (_addedRoles.indexOf(r.Id) > -1)
                _addedRoles = _.without(_addedRoles, r.Id);
            else
                _deledRoles.push(r.Id);
        }
        else {
            if(this.data.roles == null) this.data.roles = [];
            this.data.roles.push(r.Id);
            if (_deledRoles.indexOf(r.Id) > -1)
                _deledRoles = _.without(_deledRoles, r.Id);
            else
                _addedRoles.push(r.Id);
        }
    }
    $scope.addDealer = function ($item, $model, $label) {
        if (!_.some($scope.data.dealers,function (d) {
            return d.dealerID == $item.DealerID;
        })) {
            $scope.data.dealers.push($item);
            if (_deledDealers.indexOf($item.DealerID)>-1)
                _deledDealers = _.without(_deledDealers,$item.DealerID);
            else
                _addedDealers.push($item.DealerID);

        }
    };
    $scope.delDealer = function (dealer) {
        $scope.data.dealers = _.reject($scope.data.dealers,function (d) { return d.DealerID == dealer.DealerID; });
        if (_addedDealers.indexOf(dealer.DealerID)>-1)
            _addedDealers = _.without(_addedDealers,dealer.DealerID);
        else
            _deledDealers.push(dealer.DealerID);
    }
    $scope.submit = function ($event) {
        var sqlcmd = null, sqlparameter = [], _updatecmd = null, _delrolecmd = null, _insertrolecmd = null, _deldealercmd = null, _insertdealercmd = null;

        if (this.orig.user.UName != this.data.user.UName) {
            _updatecmd = _updatecmd ? String.format("{0},fullname=@fullname", _updatecmd) : String.format("update AspNetUsers set fullname=@fullname");
            sqlparameter.push({ name: "fullname", type: "String", value: this.data.user.UName });
        }
        if (this.orig.user.PhoneNumber != this.data.user.PhoneNumber) {
            _updatecmd = _updatecmd ? String.format("{0},phonenumber=@phoneNumber", _updatecmd) : String.format("update AspNetUsers set phonenumber=@phoneNumber");
            sqlparameter.push({ name: "phonenumber", type: "String", value: this.data.user.PhoneNumber });
        }
        if (this.orig.user.Lockout != this.data.user.Lockout) {
            if (this.data.user.lockout)
                _updatecmd = _updatecmd ? _updatecmd + ",LockoutEndDateUtc='2100-01-01'" : String.format("update AspNetUsers set LockoutEndDateUtc='2100-01-01'");
            else
                _updatecmd = _updatecmd ? _updatecmd + ",LockoutEndDateUtc=null" : String.format("update AspNetUsers set LockoutEndDateUtc=null");
        }
        if (_updatecmd != null) sqlcmd = _updatecmd + String.format(" where id='{0}'", this.data.user.UID);

        if (_deledRoles.length > 0) {
            _delrolecmd = String.format("delete from AspNetUserRoles where UserId='{0}' and roleid in ({1})", this.data.user.UID, _.map(_deledRoles,function (r) {
                return String.format("'{0}'", r);
            }).toString());
        }
        if (_addedRoles.length > 0) {
            _insertrolecmd = String.format("insert into AspNetUserRoles (UserId, roleid) values {0}", _.map(_addedRoles,function (r) {
                return String.format("('{0}','{1}')", $scope.data.user.UID, r);
            }).toString());
        }
        if (_delrolecmd != null) {
            if (sqlcmd == null)
                sqlcmd = _delrolecmd;
            else
                sqlcmd += ";" + _delrolecmd;
        }
        if (_insertrolecmd != null) {
            if (sqlcmd == null)
                sqlcmd = _insertrolecmd;
            else
                sqlcmd += ";" + _insertrolecmd;
        }


        if (_deledDealers.length > 0) {
            _deldealercmd = String.format("delete from dealerusers where uid='{0}' and dealer in ({1})", this.data.user.UID, _.map(_deledDealers,function (r) {
                return String.format("'{0}'", r);
            }).toString());
        }
        if (_addedDealers.length > 0) {
            _insertdealercmd = String.format("insert into dealerusers (UId, dealer) values {0}", _.map(_addedDealers,function (r) {
                return String.format("('{0}','{1}')", $scope.data.user.UID, r);
            }).toString());
        }
        if (_deldealercmd != null) {
            if (sqlcmd == null)
                sqlcmd = _deldealercmd;
            else
                sqlcmd += ";" + _deldealercmd;
        }
        if (_insertdealercmd != null) {
            if (sqlcmd == null)
                sqlcmd = _insertdealercmd;
            else
                sqlcmd += ";" + _insertdealercmd;
        }

        $.post(String.format("{0}ExecuteNonQuery", beta.global.webroot), { cmdText: AESencrypt(sqlcmd), cmdParameter: angular.toJson(sqlparameter) }).done(function (data) {
        }).fail(function (xhr, status, error) {
            $scope.notify("danger", xhr.responseText);
        });
    }
    $scope.reset = function () {
        $scope.data = angular.copy($scope.orig);
    };
    $scope.pristine = function () {
        return angular.equals(this.orig, this.data);
    };

    $scope.reset();
}

//# sourceURL=bz.usersAdmin.js