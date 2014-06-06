
function gotoController(controller, view) {
    view = view || "index";
    var _container = $('#main');
    var _url = String.format("/{0}/GetView/{1}",controller,view);
   return loadTemplate(_container, _url);
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