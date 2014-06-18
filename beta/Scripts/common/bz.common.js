

$(window).bind('statechange', function () {
    var state = History.getState();
    var _currentIdx = History.getCurrentIndex();
    // returns { data: { params: params }, title: "Search": url: "?search" }
    var _data = state.data;
    if (!hasNoValue(_data.controller) && _currentIdx != _data.idx + 1) {
        if (_data.modelName) {
            var _modelData = ko.mapping.fromJSON(sessionStorage.getItem(_data.modelName));
            var _model = new window[_data.modelName]();
            $.extend(_model, _modelData);
        }
        loadView(_data.controller, _data.view, _model, _data.bindingTarget, true);
    }
});

function loadView(controller, view, model, bindingTarget, history) {
    view = view || "index";
    var _container = $('#main');
    var _url = String.format("/{0}/GetView/{1}", controller, view);
    loadTemplate(_container, _url).done(function () {
        if (model) {
            bindingTarget = bindingTarget || '#main form,#main .bindingTarget';
            model.errors = ko.validation.group(model);
            ko.applyBindings(model, $(bindingTarget)[0]);
        }
        if (!history) {
            var _url = String.format("/{0}/{1}", controller, view);
            History.pushState({ idx: History.getCurrentIndex(), controller: controller, view: view, modelName: hasNoValue(model)?null:model.modelName, bindingTarget: bindingTarget }, view, _url);
            if (model) {
                sessionStorage.setItem(model.modelName, ko.mapping.toJSON(model));
            }
        }
    });
}

function koreset(val) {
    return val ? ko.observable(val).extend({ reset: true }) : ko.observable().extend({ reset: true });
}
function korequire(val) {
    return val ? ko.observable(val).extend({ reset: true, require: true }) : ko.observable().extend({ reset: true, require: true });
}
function koresetArray(val) {
    return val ? ko.observableArray(val).extend({ reset: true}) : ko.observableArray().extend({ reset: true });
}
function korequiretArray(val) {
    return val ? ko.observableArray(val).extend({ reset: true, require: true }) : ko.observableArray().extend({ reset: true, require: true });
}

function showNotify(msg) {
    $('.bottom-right').notify({
        message: { text: msg }
    }).show();
}

function getTypeAheadFromJson(data, property) {
    if (property)
        return $.map(data, function (n, i) {
            return n[property];
        });
    else
        return data;
}

function submitData(model) {
    var _obj = model;
    if (model.omit) {
        _obj = _(model).omit(_.union(model.omit,["omit","errors"]));
    }
    else
        if (model.pick)
            _obj = _(model).pick( model.pick);

    return ko.toJSON(_obj);
}

//layout
function getUserDealers(user) {
    $.getJSON("/Independent/GetUserDealers", { user: user }).done(function (data) {
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

var DealerUserModel = function () {
    this.users = ko.observableArray();
}

function loadUserAdmin() {
    var model = new DealerUserModel();
    loadView("UsersAdmin", "List", model),
    $.getJSON(String.format("/GetDealerUsers/{0}", beta.global.currentuser.dealer().DealerID)).done(function (data) {
        $.each(data, function () {
            model.users.push(this);
        });
    });

}