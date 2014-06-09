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

var BrowserDetect =
{
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },

    searchString: function (data) {
        for (var i = 0 ; i < data.length ; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) != -1) {
                return data[i].identity;
            }
        }
    },

    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },

    dataBrowser:
    [
        { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
        { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Safari", identity: "Safari" },
        { string: navigator.userAgent, subString: "Opera", identity: "Opera" },
    ]

};
BrowserDetect.init();

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


function loadTemplate(parent$, url, template, appendTo) {
    return $.Deferred(function (deferred) {
        if (hasNoValue(template) || hasNoValue($('#' + template))) {
            $.get(url, function (html) {
                if (appendTo)
                    parent$.append(html);
                else
                    parent$.html(html);
                deferred.resolve();
            });
        }
        else
            deferred.resolve();
    }).promise();
}

function resetViewModel(self, event) {
    if (event) event.preventDefault();
    for (key in self) {
        if (ko.isObservable(self[key]) && typeof self[key].reset == 'function') {
            self[key].reset();
        }
    }
}
function updateObjectValues(source, target) {
    var _tkeys = _(target).keys();
    $.each(_(source).keys(), function () {
        var _key = this;
        var _tkey = _(_tkeys).find(function (k) { return k.toLowerCase() == _key.toLowerCase() });
        if (_tkey) {
            if (_(target[_tkey]).isFunction()) {
                if (_(source[this]).isFunction()) {
                    if (ko.isWriteableObservable(target[_tkey]))
                        target[_tkey](source[this]());
                }
                else
                    target[_tkey](source[this]);
            }
            else {
                if (_(source[this]).isFunction())
                    target[_tkey] = source[this]();
                else
                    target[_tkey] = source[this];
            }
        }
    });
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

//ko
ko.extenders.reset = function (target) {
    var initialValue = target();

    target.reset = function () {
        target(initialValue);
    }

    return target;
};
