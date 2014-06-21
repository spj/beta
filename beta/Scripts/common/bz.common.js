

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
            model.errors = ko.validation.group(model).watch(false);
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
function korequireArray(val) {
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
    this.edit = function (user) {
        var _userViewModel = new UserViewModel();
        if (hasNoValue(beta.global.roles)) {
            $.getJSON("/GetRoles").done(function (data) {
                beta.global.roles=data;
            });
        }
        loadView("UsersAdmin", "Details", _userViewModel);
        $.getJSON(String.format("/GetUserDealersAndRoles/{0}", user.UID)).done(function (data) {
            _userViewModel.id = user.UID;
            setOriginal(_userViewModel.email,user.Email);
            setOriginal(_userViewModel.fullname,user.UName);
            setOriginal(_userViewModel.lockout,!hasNoValue(user.LockoutEndDate));
            setOriginal(_userViewModel.dealers, data.dealers, function (obj) {
                return _.difference(_(getOrignal(obj)).pluck("DealerID"), _(obj()).pluck("DealerID")).length > 0;
            });
            setOriginal(_userViewModel.roles,_(beta.global.roles).map(function(role){
                return { id: role.Id, name: role.Name, selected: ko.observable(_(data.roles).contains(role.Id)) };
            }), function (obj) {
                var _original = [], _final=[];
                $.each(getOrignal(obj), function () {
                    if (this.selected) _original.push(this.id);
                });
                $.each(obj(), function () {
                    if (this.selected()) _final.push(this.id);
                });
                return _.difference(_original, _final).length > 0;
            });
            //applyChangeTracking(_userViewModel, _userViewModel.pick);
        });
    }
}

var UserViewModel = function () {
    var _self = this;
    this.pick = ["id","email","fullname","lockout","roles","dealers"];
    this.id = null;
    this.sqlcmd = null;
    this.dirty = function () {
        var _dirty = false, _updatecmd=null, _delrolecmd=null, _insertrolecmd=null, _deldealercmd=null,_insertdealercmd=null;
        if (this.email.isdirty()) {
            _dirty = true;
            _updatecmd = String.format("update AspNetUsers set email='{0}'", this.email());
        }
        if (this.fullname.isdirty()) {
            _dirty = true;
            _updatecmd = _updatecmd? String.format("{0},fullname='{1}'",_updatecmd, this.fullname()):  String.format("update AspNetUsers set fullname='{0}'", this.fullname());
        }
        if (this.lockout.isdirty()) {
            _dirty = true;
            if (this.lockout())
                _updatecmd = _updatecmd ? _updatecmd+ ",LockoutEndDateUtc='2100-01-01'" : String.format("update AspNetUsers set LockoutEndDateUtc='2100-01-01'");
            else
                _updatecmd = _updatecmd ?_updatecmd + ",LockoutEndDateUtc=null" : String.format("update AspNetUsers set LockoutEndDateUtc=null");
        }
        if (_updatecmd != null) this.sqlcmd = _updatecmd + String.format(" where id='{0}'", this.id);

        if (this.roles.isdirty()) {
            _dirty = true;
            var _original = [], _final = [], _dels = [], _inserts = [];
            $.each(getOrignal(this.roles), function () {
                if (this.selected) _original.push(this.id);
            });
            $.each(this.roles(), function () {
                if (this.selected()) _final.push(this.id);
            });
            _dels = _(_original).difference(_final);
            _inserts = _(_final).difference(_original);
            if (_dels.length > 0) {
                _delrolecmd = String.format("delete from AspNetUserRoles where UserId='{0}' and roleid in ({1})", this.id, _(_dels).map(function (r) {
                    return String.format("'{0}'",r);
                }).toString());
            }
            if (_inserts.length > 0) {
                _insertrolecmd = String.format("insert into AspNetUserRoles (UserId, roleid) values {0}",  _(_inserts).map(function (r) {
                    return String.format("('{0}','{1}')", _self.id, r);
                }).toString());
            }
            if (_delrolecmd != null) {
                if (this.sqlcmd == null)
                    this.sqlcmd = _delrolecmd;
                else
                    this.sqlcmd += ";"+_delrolecmd;
            }
            if (_insertrolecmd != null) {
                if (this.sqlcmd == null)
                    this.sqlcmd = _insertrolecmd;
                else
                    this.sqlcmd += ";" + _insertrolecmd;
            }
        }
        if (this.dealers.isdirty()) {
            _dirty = true;
            var _original = _(getOrignal(this.dealers)).pluck("DealerID"),
                _final = _(this.dealers()).pluck("DealerID"),
                _dels = [], _inserts = [];
            _dels = _(_original).difference(_final);
            _inserts = _(_final).difference(_original);
            if (_dels.length > 0) {
                _deldealercmd = String.format("delete from dealerusers where uid='{0}' and dealer in ({1})", this.id, _(_dels).map(function (r) {
                    return String.format("'{0}'", r);
                }).toString());
            }
            if (_inserts.length > 0) {
                _insertdealercmd = String.format("insert into dealerusers (UId, dealer) values {0}", _(_inserts).map(function (r) {
                    return String.format("('{0}','{1}')", _self.id, r);
                }).toString());
            }
            if (_deldealercmd != null) {
                if (this.sqlcmd == null)
                    this.sqlcmd = _deldealercmd;
                else
                    this.sqlcmd += ";" + _deldealercmd;
            }
            if (_insertdealercmd != null) {
                if (this.sqlcmd == null)
                    this.sqlcmd = _insertdealercmd;
                else
                    this.sqlcmd += ";" + _insertdealercmd;
            }
        }
        return _dirty;
    };
    this.email = korequire();
    this.fullname = korequire();
    this.lockout = korequire();
    this.dealerObj = koreset();
    this.dealerName = koreset().watch(false);
    this.dealers = korequireArray().watch(this.dealerObj, function (parents, child, item) {
        if (_(this()).some(function (d) {
            return d.DealerID == child().DealerID;
        })) return;
        this.push(child());
    }, this.dealers);
    this.del = function (dealer) {
        _self.dealers.remove(dealer);
    };
    this.roles = korequireArray();
    this.submit = function (form) {
        if (this.errors().length == 0 ){
            if(this.dirty()) {
                console.log(this.sqlcmd);
                //var _changes = getChangesFromModel(this);
                $.post("/ExecuteNonQuery", { cmdText: this.sqlcmd }).done(function (data) {                  
                }).fail(function (xhr, status, error) {
                    showNotify(xhr.responseText);
                });
            }
        } else {
            this.errors.showAllMessages();
        }
    };
    this.reset = function (data, event) {
        resetViewModel(this, event);
    };
}

function loadUserAdmin() {
    var model = new DealerUserModel();
    loadView("UsersAdmin", "List", model),
    $.getJSON(String.format("/GetDealerUsers/{0}", beta.global.currentuser.dealer().DealerID)).done(function (data) {
        model.users(data);
    });

}

var _typeaheadObjects = [];
var dealerTypeaheadHelper = function () {
    return {
        option: {
            minLength: 4,
            source: function (query, process) {
                return $.getJSON(String.format("/Dealers/{0}", query)).done(function (data) {
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