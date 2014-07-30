angular.module("bz.Directives", [])
//.directive('validationExpression', ['$parse', function ($parse) {//validation-check="data.confirmPassword == data.clearPassword"
//    return {
//        require: 'ngModel',
//        link: function (scope, elm, attrs, ngModel) {
//            var check = $parse(attrs.validationCheck);
//            // Watch for changes to this input
//            scope.$watch(check, function (newValue) {
//                ngModel.$setValidity(attrs.name, newValue);
//            });
//        }
//    };
//}]);
.directive('validationExpression', function ($parse) {//validation-expression="data.confirmPassword == data.clearPassword"
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModel) {
            var check = $parse(attrs.validationExpression);
            // Watch for changes to this input
            scope.$watch(check, function (newValue) {
                ngModel.$setValidity(attrs.name, newValue);
            });
        }
    };
})
.directive('validationCheck', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModel) {
            var _title = attrs.validationCheck||"";
            elm.on("keyup", function () {
                if (ngModel.$invalid) {
                    if (ngModel.$error.minlength) {
                        _title = String.format("min length {0}",attrs.ngMinlength);
                    }
                    if (ngModel.$error.maxlength) {
                        if (_title)
                            _title = String.format("max length {0}\n{1}", attrs.ngMaxlength, _title);
                        else
                            _title = String.format("max length {0}", attrs.ngMaxlength);
                    }
                    if (!elm.attr("title")) {
                        elm.attr("title",_title);
                    }
                }
                else {
                    if (attrs["validationChecker"]) {
                        var _err = scope[attrs["validationChecker"]](ngModel.$viewValue);
                        if (_err) {
                            _title = String.format("{0}\n{1}", _title, _err);
                            ngModel.$setValidity(ngModel.$name,false);
                        }
                    }
                    if (ngModel.$invalid) {
                        elm.attr("title", _title);
                    }
                    else {
                        if (elm.attr("title")) {
                            elm.removeAttr("title");
                        }
                    }
                }
            });
            //scope.$watch(attrs.ngModel, function (newValue, oldValue) {
            //    console.log(ngModel);
            //});
        }
    };
});