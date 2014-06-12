﻿// Setup CSRF safety for AJAX:
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
