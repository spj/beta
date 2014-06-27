
function loadUserAdmin() {
    var _url = String.format("{0}{1}/GetView/{2}",beta.global.webroot, 'UsersAdmin', 'List');
    var _container = '#main';
    var _prefix = "UsersAdminListView"; _tmpl = _prefix + "Tmpl"; _modelName = _prefix + "Model";
    $.when(
    loadTemplate({ url: _url, template: _tmpl, container: _container, elementID: _prefix, modelName: _modelName, historyUrl: String.format("{0}UsersAdmin/List", beta.global.webroot) }),
    $.getJSON(String.format("{0}GetDealerUsers/{1}",beta.global.webroot, beta.global.currentuser.dealer().DealerID))).done(function (model, users) {
        model.users(users[0]);
    });
    ko.watch(beta.global.currentuser.dealer, function (parents, child, item) {
        loadUserAdmin();
    });
}
function loadRegister() {
    var _url = String.format("{0}{1}/GetView/{2}",beta.global.webroot, 'Account', 'Register');
    var _container = '#main';
    var _prefix = "RegisterView"; _tmpl = _prefix + "Tmpl"; _modelName = _prefix + "Model";
    loadTemplate({ url: _url, template: _tmpl, container: _container, element: _prefix, modelName: _modelName, historyUrl: String.format("{0}Register", beta.global.webroot) });
}

function getUserDealers(user) {
    $.getJSON(String.format("{0}Independent/GetUserDealers", beta.global.webroot), { user: user }).done(function (data) {
        var _uobj = { email: user, fullname: data.UserFullName };
        _uobj.dealer = ko.observable(data.Dealers[0]);
        _uobj.dealers = data.Dealers;
        beta.global.currentuser = _uobj;
        beta.global.currentuser.change = function (dealer) {
            beta.global.currentuser.dealer(dealer);
        };
        ko.applyBindings(beta.global.currentuser, $('#currentuser')[0]);
    });

}
var _typeaheadObjects = [];
var dealerTypeaheadHelper = function () {
    return {
        option: {
            minLength: 4,
            source: function (query, process) {
                return $.getJSON(String.format("{0}Dealers/{1}",beta.global.webroot, query)).done(function (data) {
                    _typeaheadObjects = data;
                    process(getTypeAheadFromJson(data, 'Name'));
                });
            }
            ,
            updater: function (dealer) {
                var _d = _(_typeaheadObjects).find(function (d) {
                    return d.Name == dealer;
                });
                var _model = ko.dataFor($('#main form')[0]);
                _model.dealerObj(_d);
                return _d.Name;
            }
        }
    };
};