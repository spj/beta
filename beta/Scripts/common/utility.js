// Setup CSRF safety for AJAX:
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (options.type.toUpperCase() === "POST") {
        // We need to add the verificationToken to all POSTs
        var token = $("input[name^=__RequestVerificationToken]").first();
        if (!token.length) return;

        var tokenName = token.attr("name");

        // If the data is JSON, then we need to put the token in the QueryString:
        if (options.contentType.indexOf('application/json') === 0) {
            // Add the token to the URL, because we can't add it to the JSON data:
            options.url += ((options.url.indexOf("?") === -1) ? "?" : "&") + token.serialize();
        } else if (typeof options.data === 'string' && options.data.indexOf(tokenName) === -1) {
            // Append to the data string:
            options.data += (options.data ? "&" : "") + token.serialize();
        }
    }
});

$(window).bind('statechange', function () {
    var state = History.getState();
    var _currentIdx = History.getCurrentIndex();
    // returns { data: { params: params }, title: "Search": url: "?search" }
    var _data = state.data;
    if (_data && _data.hasOwnProperty("idx") && _currentIdx != _data.idx + 1) {
        if (_currentIdx > 0)
            updateHitoryState(_currentIdx - 1);
        loadTemplate(_data.options, false);
    }
});

//refresh(F5)
//if (History.getCurrentIndex() == 0) {
//    History.Adapter.trigger(window, 'statechange');
//}

function hasNoValue(object) {
    return _.isNaN(object) || _.isNull(object) || _.isUndefined(object) || _.isEmpty(object);
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

String.prototype.endsWith = function (suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.startsWith = function (prefix) {
    return (this.substr(0, prefix.length) === prefix);
}

function submitData(model, properties) {
    var _obj = model;
    if (properties)
        _obj = _.pick(_obj,properties);
    _obj = _.mapValues(_obj, function (o) { return _.escape(o); });
    return angular.toJson(_obj);
}

function getTypeAheadFromJson(data, property) {
    if (property)
        return $.map(data, function (n, i) {
            return n[property];
        });
    else
        return data;
}
function bindingAndHistoryTemplate(options, isnew) {
    var model = null;
    if (options.modelName) {
        model = new window[options.modelName]();
        model.errors = ko.validation.group(model).watch(false);
        if (sessionStorage.getItem(options.modelName)){
            var _modelData = ko.mapping.fromJSON(sessionStorage.getItem(options.modelName));
            $.extend(model, _modelData);
        }
        ko.applyBindings(model, $('#' + options.elementID)[0]);
    }
    if (isnew) {
        History.pushState({ idx: History.getCurrentIndex(), options: options }, null, options.historyUrl);
        if (options.modelName) {
            sessionStorage.setItem(options.modelName, ko.mapping.toJSON(model));
        }
    }
    return model;
}

function updateHitoryState(idx) {
    idx = idx || History.getCurrentIndex();
    var state = History.getStateByIndex(idx);
    var data = state.data;
    if (hasNoValue(data) || data && hasNoValue(data.options.modelName) || $('#' + data.options.elementID).length==0) return;
    var model = ko.dataFor($('#' + data.options.elementID)[0]);
    sessionStorage.setItem(data.options.modelName, ko.mapping.toJSON(model));
}

function getAddressInfoByZip(zip) {
    return $.Deferred(function (deferred) {
        var addr = {};
        if (zip == null || zip.length < 5 || typeof google == 'undefined') deferred.reject();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': zip }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results.length >= 1) {
                    for (var ii = 0; ii < results[0].address_components.length; ii++) {
                        var street_number = route = street = city = state = zipcode = country = formatted_address = '';
                        var types = results[0].address_components[ii].types.join(",");
                        if (types == "street_number") {
                            addr.street_number = results[0].address_components[ii].long_name;
                        }
                        if (types == "route" || types == "point_of_interest,establishment") {
                            addr.route = results[0].address_components[ii].long_name;
                        }
                        if (types == "sublocality,political" || types == "locality,political" || types == "neighborhood,political" || types == "administrative_area_level_3,political") {
                            addr.city = (city == '' || types == "locality,political") ? results[0].address_components[ii].long_name : city;
                        }
                        if (types == "administrative_area_level_1,political") {
                            addr.state = results[0].address_components[ii].short_name;
                        }
                        if (types == "postal_code" || types == "postal_code_prefix,postal_code") {
                            addr.zipcode = results[0].address_components[ii].long_name;
                        }
                        if (types == "country,political") {
                            addr.country = results[0].address_components[ii].long_name;
                        }
                    }
                    deferred.resolve(addr);
                }
            }
            else
                deferred.reject();
        });
    }).promise();
}
function AESencrypt(content){
  return  CryptoJS.AES.encrypt(content, "beta").toString();
}

