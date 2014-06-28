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

function koreset(val) {
    return val ? ko.observable(val).extend({ reset: true }) : ko.observable().extend({ reset: true });
}
function korequire(val) {
    return val ? ko.observable(val).extend({ reset: true, required: true }) : ko.observable().extend({ reset: true, required: true });
}
function koresetArray(val) {
    return val ? ko.observableArray(val).extend({ reset: true }) : ko.observableArray().extend({ reset: true });
}
function korequireArray(val) {
    return val ? ko.observableArray(val).extend({ reset: true, required: true }) : ko.observableArray().extend({ reset: true, required: true });
}

function getValue(obj) {
    if (ko.isObservable(obj)) return obj();
    return obj;
}
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

function submitData(model) {
    var _obj = model;
    if (model.omit) {
        _obj = _(model).omit(_.union(model.omit, ["omit", "errors"]));
    }
    else
        if (model.pick)
            _obj = _(model).pick(model.pick);

    return ko.toJSON(_obj);
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
function loadTemplate(options, isnew) {
    //option={url, template, container,elementID, modelName, historyUrl}
    return $.Deferred(function (deferred) {
        if(_.isUndefined(isnew)) isnew = true;
        updateHitoryState();
        if (hasNoValue(options.template) || $('#' + options.template).length == 0) {
            $.get(options.url).done(function (html) {
                if (hasNoValue(options.template)) {
                    if (options.container) {
                        $(options.container).html($(String.format("<div id='{0}'></div>", options.elementID)).html(html));
                    }
                }
                else {
                    $('body').append(html);
                    if (options.container) {
                        $(options.container).html(String.format("<div id='{0}' data-bind='template:{name:&quot;{1}&quot;}'></div>", options.elementID, options.template));
                    }
                }
                deferred.resolve(bindingAndHistoryTemplate(options, isnew));
            });
        }
        else {
            if (options.container) {
                $(options.container).html(String.format("<div id='{0}' data-bind='template:{name:&quot;{1}&quot;}'></div>", options.elementID, options.template));
            }
            deferred.resolve(bindingAndHistoryTemplate(options, isnew));
        }
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
function AESencrypt(content){
  return  CryptoJS.AES.encrypt(content, "beta").toString();
}
// Written by Luke Morton, licensed under MIT
(function ($) {
    $.fn.watchChanges = function () {
        return this.each(function () {
            $.data(this, 'formHash', $(this).serialize());
        });
    };

    $.fn.hasChanged = function () {
        var hasChanged = false;

        this.each(function () {
            var formHash = $.data(this, 'formHash');

            if (formHash != null && formHash !== $(this).serialize()) {
                hasChanged = true;
                return false;
            }
        });

        return hasChanged;
    };

}).call(this, jQuery);
// In this example we detect if a user clicks a link to travel elsewhere but has made changes to a form. If they have changed the form it prompts them to confirm before continuing.
    //var $form = $('form').watchChanges();
 
    //$('a').click(function (e) {
    //    if ($form.hasChanged() and ! confirm('Continue without saving changes?')) {
    //        e.preventDefault();
    //    }
    //});


//ko
function setkoArrayValue(obj, values){
    var _obj = obj();
    $.each(values, function (i,value) {
        _obj[i] = value;
    });
    obj.valueHasMutated();
}

function setOriginal(obj, value, isdirty) {//value is supposed to be a simple type
    if (value instanceof Array) obj.original = ko.mapping.toJSON(value);
    else
        if (ko.observable(value)) obj.original = ko.mapping.toJS(value);
        else obj.original = value;
    obj.isdirty = function () {
        if (obj().length != getOrignal(obj).length) return true;
        return isdirty ? isdirty(obj) : obj() != obj.original;
    };
    if (obj.original instanceof Array) {
        setkoArrayValue(obj, value);
    }
    else
        obj(value);
}

function getOrignal(obj) {
    if (obj() instanceof Array) return JSON.parse(obj.original);
    return obj.original;
}

ko.validation.setError = function(property, err) {
    property.error = "Not found!";
    property.__valid__(false);
}
ko.validation.clearError = function (property) {
    property.error = null;
    property.__valid__(true);
}
ko.extenders.reset = function (target) {
    var initialValue = target();

    target.reset = function () {
        target(initialValue);
    }
    return target;
};

ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor) {
        var helper = ko.unwrap(valueAccessor()) || {},
            $el = $(element),
            triggerChange = function () {
                $el.change();
            }
        $el.typeahead(helper().option);
        //twitter
        //initialize widget and ensure that change event is triggered when updated
        //$el.typeahead(helper().option, helper().dataset)
        //    .on("typeahead:selected", triggerChange)
        //    .on("typeahead:autocompleted", triggerChange);

        //if KO removes the element via templating, then destroy the typeahead
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.typeahead("destroy");
            $el = null;
        });
    }
};

(function ($, ko) {
    //update jquery-ui to support D&D
    $.each($.ui.draggable.prototype.plugins['stop'], function () {
        switch (this[0]) {
            case "cursor":
                this[1] = function () {
                    if ($(this).data('draggable')) {//peter
                        var o = $(this).data("ui-draggable").options;
                        if (o._cursor) {
                            $("body").css("cursor", o._cursor);
                        }
                    }
                };
                break;
            case "opacity":
                this[1] = function (event, ui) {
                    if ($(this).data('draggable')) {//peter
                        var o = $(this).data("ui-draggable").options;
                        if (o._opacity) {
                            $(ui.helper).css("opacity", o._opacity);
                        }
                    }
                };
                break;
            case "zIndex":
                this[1] = function (event, ui) {
                    if ($(this).data('draggable')) {//peter
                        var o = $(this).data("ui-draggable").options;
                        if (o._zIndex) {
                            $(ui.helper).css("zIndex", o._zIndex);
                        }
                    }
                };
                break;
        }
    });
    ko.bindingHandlers.drag = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var options = ko.utils.unwrapObservable(valueAccessor().dragOptions);
            $(element).draggable(options);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //var disabled = !!ko.utils.unwrapObservable(valueAccessor().disabled);
            //$(element).draggable("option", "disabled", disabled);
        }
    };
    ko.bindingHandlers.drop = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var options = ko.utils.unwrapObservable(valueAccessor().dropOptions);
            $(element).droppable(options);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //var disabled = !!ko.utils.unwrapObservable(valueAccessor().disabled);
            //dropElement.droppable(“option”, “disabled”, disabled); didn’t work. jQueryUI bug?
            //$(element).droppable("option", "accept", disabled ? ".nothing" : "*");
        }
    };

    ko.bindingHandlers.sortableMenuRows = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            //  var list = valueAccessor();
            var helper = allBindings.get('sortableHelper');
            $(element).sortable({
                handle: '.dragHandle',
                helper: helper,
                update: function (event, ui) {
                    var list = viewModel.menuBody().rows;
                    //retrieve our actual data item
                    var item = ko.dataFor(ui.item[0]);
                    //figure out its new position
                    var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                    //remove the item and add it back in the right spot
                    if (position >= 0) {
                        list.remove(item);
                        list.splice(position, 0, item);
                    }
                    ui.item.remove();
                }
            });
        }
    };

    ko.bindingHandlers.popConfirm = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var self = $(element);
            var defalut = {
                title: '',
                content: locale('Are you really sure ?'),
                placement: 'left',
                container: 'body',
                yesBtn: 'Yes',
                noBtn: 'No'
            };
            var options = valueAccessor() ? ko.utils.unwrapObservable(valueAccessor().options) : {};
            $.extend(defalut, options);
            $(element).popConfirm(defalut);
        }
    };
    ko.bindingHandlers.select = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).addClass('selectpicker').selectpicker();
            if (valueAccessor() && valueAccessor().hide) {
                $(element).next().hide();
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            $(element).selectpicker('refresh');
        }
    };
    //<select multiple data-bind="selectPicker: teamID, optionsText: 'text', optionsValue : 'id', selectPickerOptions: { optionsArray: teamItems }"></select>
    ko.bindingHandlers.selectPicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            if ($(element).is('select')) {
                if (ko.isObservable(valueAccessor())) {
                    if ($(element).prop('multiple') && $.isArray(ko.utils.unwrapObservable(valueAccessor()))) {
                        // in the case of a multiple select where the valueAccessor() is an observableArray, call the default Knockout selectedOptions binding
                        ko.bindingHandlers.selectedOptions.init(element, valueAccessor, allBindingsAccessor);
                    } else {
                        // regular select and observable so call the default value binding
                        ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
                    }
                }
                $(element).addClass('selectpicker').selectpicker();
                //ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                //    // This will be called when the element is removed by Knockout or if some other part of your code calls ko.removeNode(element)
                //    $(element).selectpicker("destroy");
                //});
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            if ($(element).is('select')) {
                var selectPickerOptions = allBindingsAccessor().selectPickerOptions;
                if (typeof selectPickerOptions !== 'undefined' && selectPickerOptions !== null) {
                    var options = selectPickerOptions.optionsArray,
                        optionsText = selectPickerOptions.optionsText,
                        optionsValue = selectPickerOptions.optionsValue,
                        optionsCaption = selectPickerOptions.optionsCaption,
                        isDisabled = selectPickerOptions.disabledCondition || false,
                        resetOnDisabled = selectPickerOptions.resetOnDisabled || false;
                    if (ko.utils.unwrapObservable(options).length > 0) {
                        // call the default Knockout options binding
                        ko.bindingHandlers.options.update(element, options, allBindingsAccessor);
                    }
                    if (isDisabled && resetOnDisabled) {
                        // the dropdown is disabled and we need to reset it to its first option
                        $(element).selectpicker('val', $(element).children('option:first').val());
                    }
                    $(element).prop('disabled', isDisabled);
                }
                if (ko.isObservable(valueAccessor())) {
                    if ($(element).prop('multiple') && $.isArray(ko.utils.unwrapObservable(valueAccessor()))) {
                        // in the case of a multiple select where the valueAccessor() is an observableArray, call the default Knockout selectedOptions binding
                        ko.bindingHandlers.selectedOptions.update(element, valueAccessor, allBindingsAccessor);
                    } else {
                        // call the default Knockout value binding
                        ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor);
                    }
                }

                $(element).selectpicker('refresh');
            }
        }
    };

    ko.bindingHandlers.select = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).addClass('selectpicker').selectpicker();
            if (valueAccessor() && valueAccessor().hide) {
                $(element).next().hide();
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            $(element).selectpicker('refresh');
        }
    };
    //<input data-bind="datepicker: date, datepickerOptions: { minDate: new Date() }" />
    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var options = $.extend(allBindingsAccessor().datepickerOptions, { format: "yyyy-mm-dd" }) || { format: "yyyy-mm-dd" };
            $(element).datepicker(options);

            //handle the field changing
            ko.utils.registerEventHandler(element, "changeDate", function () {
                var observable = valueAccessor();
                observable($(element).val());
                $(element).datepicker("hide");;
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).datepicker("destroy");
            });

        },
        //update the control when the view model changes
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                current = $(element).val();

            if (value !== current) {
                $(element).datepicker("setValue", value);
            }
        }
    };
    ko.forcibleComputed = function (readFunc, context, options) {
        var trigger = ko.observable().extend({ notify: 'always' }),
			target = ko.computed(function () {
			    trigger();
			    return readFunc.call(context);
			}, null, options);
        target.evaluateImmediate = function () {
            trigger.valueHasMutated();
        };
        return target;
    };
})(jQuery, ko);


//change tracking
var getObjProperties = function (obj, properties) {
    var objProperties = [];
    var val = ko.utils.unwrapObservable(obj);

    if (val !== null && typeof val === 'object') {
        for (var i in val) {
            if (val.hasOwnProperty(i)) {
                if (properties && !_(properties).contains(i)) continue;
                objProperties.push({ "name": i, "value": val[i] });
            }
        }
    }

    return objProperties;
};

var traverseObservables = function (obj, action) {
    ko.utils.arrayForEach(getObjProperties(obj), function (observable) {
        if (observable && observable.value && !observable.value.nodeType && ko.isObservable(observable.value)) {
            action(observable);
        }
    });
};

ko.extenders.trackChange = function (target, track) {
    if (track) {
        target.hasValueChanged = ko.observable(false);
        target.hasDirtyProperties = ko.observable(false);

        target.isDirty = ko.computed(function () {
            return target.hasValueChanged() || target.hasDirtyProperties();
        });

        var unwrapped = target();
        if ((typeof unwrapped == "object") && (unwrapped !== null)) {
            traverseObservables(unwrapped, function (obj) {
                applyChangeTrackingToObservable(obj.value);

                obj.value.isDirty.subscribe(function (isdirty) {
                    if (isdirty) target.hasDirtyProperties(true);
                });
            });
        }

        target.originalValue = target();
        target.subscribe(function (newValue) {
            // use != not !== so numbers will equate naturally
            target.hasValueChanged(newValue != target.originalValue);
            target.hasValueChanged.valueHasMutated();
        });

        if (!target.getChanges) {
            target.getChanges = function (newObject) {
                var obj = target();
                if ((typeof obj == "object") && (obj !== null)) {
                    if (target.hasValueChanged()) {
                        return ko.mapping.toJS(obj);
                    }
                    return getChangesFromModel(obj);
                }

                return target();
            };
        }
    }

    return target;
};

var applyChangeTrackingToObservable = function (observable) {
    // Only apply to basic writeable observables
    if (observable && !observable.nodeType && !observable.refresh && ko.isObservable(observable)) {
        if (!observable.isDirty) observable.extend({ trackChange: true });
    }
};

var applyChangeTracking = function (obj, properties) {

     properties = getObjProperties(obj, properties);
    ko.utils.arrayForEach(properties, function (property) {
        applyChangeTrackingToObservable(property.value);
    });
};

var getChangesFromModel = function (obj) {
    var changes = null;
    var properties = getObjProperties(obj);

    ko.utils.arrayForEach(properties, function (property) {
        if (property.value != null && typeof property.value.isDirty != "undefined" && property.value.isDirty()) {
            changes = changes || {};
            changes[property.name] = property.value.getChanges();
        }
    });

    return changes;
};

//var viewModel = {
//    Name: ko.observable("Pete"),
//    Age: ko.observable(29),
//    Skills: ko.observable({
//        Tdd: ko.observable(true),
//        Knockout: ko.observable(true),
//        ChangeTracking: ko.observable(false),
//        Languages: ko.observable({
//            Csharp: ko.observable(false),
//            Javascript: ko.observable(false)
//        }),
//    }),
//    Occupation: ko.observable("Developer")
//};

//applyChangeTracking(viewModel);

//viewModel.Skills().ChangeTracking(true);
//viewModel.Skills().Languages({
//    Csharp: ko.observable(true),
//    Javascript: ko.observable(true),
//});

//console.log(getChangesFromModel(viewModel));
