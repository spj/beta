
ko.validation.rules['passwordComplexity'] = {
    validator: function (val) {
        return /(?=^[^\s]{6,128}$)((?=.*?\d)(?=.*?[A-Z])(?=.*?[a-z])|(?=.*?\d)(?=.*?[^\w\d\s])(?=.*?[a-z])|(?=.*?[^\w\d\s])(?=.*?[A-Z])(?=.*?[a-z])|(?=.*?\d)(?=.*?[A-Z])(?=.*?[^\w\d\s]))^.*/.test('' + val + '');
    },
    message: 'Password must be between 6 and 128 characters long and contain three of the following 4 items: upper case letter, lower case letter, a symbol, a number'
};

ko.validation.configure({
    registerExtenders: true,
    errorsAsTitleOnModified: true,
    insertMessages: false,
    parseInputAttributes: true,
    decorateElement: true,
    writeInputAttributes:true
});