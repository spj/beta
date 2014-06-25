

$(window).bind('statechange', function () {
    var state = History.getState();
    var _currentIdx = History.getCurrentIndex();
    // returns { data: { params: params }, title: "Search": url: "?search" }
    var _data = state.data;
    if ( _currentIdx != _data.idx + 1) {
        if (_currentIdx > 0)
            updateHitoryState(_currentIdx - 1);
        loadTemplate(_data.options, false);
    }
});

function getValue(obj) {
    if (ko.isObservable(obj)) return obj();
    return obj;
}

function loadView(controller, view) {
    view = view || "index";
    var _container = '#main';
    var _url = String.format("/{0}/GetView/{1}", controller, view);
    loadTemplate({ url: _url, container: _container, historyUrl: String.format("/{0}/{1}", controller, view) });
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

