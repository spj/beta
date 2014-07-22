
var UsersAdminListViewModel = function () {
	this.users = ko.observableArray();
	this.edit = function (user) {
		if (hasNoValue(beta.global.roles)) {
		    $.getJSON(String.format("{0}GetRoles",beta.global.webroot)).done(function (data) {
				beta.global.roles = data;
			});
		}
		var _url = String.format("{0}{1}/GetView/{2}",beta.global.webroot, 'UsersAdmin', 'Details');
		var _container = '#main';
		var _prefix = "UsersAdminView"; _tmpl = _prefix + "Tmpl"; _modelName = _prefix + "Model";
		$.when(
		loadTemplate({ url: _url, template: _tmpl, container: _container, elementID: _prefix, modelName: _modelName, historyUrl: String.format("{0}UsersAdmin/Detail", beta.global.webroot) }),
		$.getJSON(String.format("{0}GetUserDealersAndRoles/{1}", beta.global.webroot,user.UID))).done(function (model, data) {
			model.id = user.UID;
			model.email = user.Email;
			setOriginal(model.fullname, getValue(user.UName));
			setOriginal(model.lockout, !hasNoValue(getValue(user.LockoutEndDate)));
			setOriginal(model.dealers, data[0].dealers, function (obj) {
				return _.difference(_(getOrignal(obj)).pluck("DealerID"), _(obj()).pluck("DealerID")).length > 0;
			});
			setOriginal(model.roles, _(beta.global.roles).map(function (role) {
				return { id: role.Id, name: role.Name, selected: ko.observable(_(data[0].roles).contains(role.Id)) };
			}), function (obj) {
				var _original = [], _final = [];
				$.each(getOrignal(obj), function () {
					if (this.selected) _original.push(this.id);
				});
				$.each(obj(), function () {
					if (this.selected()) _final.push(this.id);
				});
				return _original.length != _final.length || _.difference(_original, _final).length > 0;
			});
			//applyChangeTracking(_userViewModel, _userViewModel.pick);
		});
	}
}

var UsersAdminViewModel = function () {
	var _self = this, sqlcmd = null, sqlparameter = [];
	this.pick = ["id", "fullname", "lockout", "roles", "dealers"];
	this.id = null;
	this.dirty = function () {
		var _dirty = false, _updatecmd = null, _delrolecmd = null, _insertrolecmd = null, _deldealercmd = null, _insertdealercmd = null;
		if (this.fullname.isdirty()) {
			_dirty = true;
			_updatecmd = _updatecmd ? String.format("{0},fullname=@fullname", _updatecmd) : String.format("update AspNetUsers set fullname=@fullname");
			sqlparameter.push({ name: "fullname", type: "String", value: this.fullname() });
		}
		if (this.lockout.isdirty()) {
			_dirty = true;
			if (this.lockout())
				_updatecmd = _updatecmd ? _updatecmd + ",LockoutEndDateUtc='2100-01-01'" : String.format("update AspNetUsers set LockoutEndDateUtc='2100-01-01'");
			else
				_updatecmd = _updatecmd ? _updatecmd + ",LockoutEndDateUtc=null" : String.format("update AspNetUsers set LockoutEndDateUtc=null");
		}
		if (_updatecmd != null) sqlcmd = _updatecmd + String.format(" where id='{0}'", this.id);

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
					return String.format("'{0}'", r);
				}).toString());
			}
			if (_inserts.length > 0) {
				_insertrolecmd = String.format("insert into AspNetUserRoles (UserId, roleid) values {0}", _(_inserts).map(function (r) {
					return String.format("('{0}','{1}')", _self.id, r);
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
		}
		return _dirty;
	};
	this.email = null;
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
	    this.errors = ko.validation.group(this);
		if (this.isValid()) {
			if (this.dirty()) {
				//var _changes = getChangesFromModel(this);
			    $.post(String.format("{0}ExecuteNonQuery", beta.global.webroot), { cmdText: AESencrypt(sqlcmd), cmdParameter: ko.toJSON(sqlparameter) }).done(function (data) {
				    var _model = ko.mapping.fromJSON(sessionStorage.getItem("UsersAdminListViewModel"));
				    var _user = _(_model.users()).find(function (u) {
				        return u.UID() == _self.id;
				    });
				    _user.UName(_self.fullname());
				    sessionStorage.setItem("UsersAdminListViewModel", ko.toJSON(_model));
				    History.back();
				}).fail(function (xhr, status, error) {
					showNotify(xhr.responseText);
				});
			}
		} 
	};
	this.reset = function (data, event) {
		resetViewModel(this, event);
	};
}
//# sourceURL=bz.usersAdmin.js