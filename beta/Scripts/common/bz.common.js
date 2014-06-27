
function loadView(controller, view) {
    view = view || "index";
    var _container = '#main';
    var _url = String.format("{0}{1}/GetView/{2}",beta.global.webroot, controller, view);
    loadTemplate({ url: _url, container: _container, historyUrl: String.format("{0}{1}/{2}",beta.global.webroot, controller, view) });
}

function showNotify(msg) {
    $('.bottom-right').notify({
        message: { text: msg }
    }).show();
}



