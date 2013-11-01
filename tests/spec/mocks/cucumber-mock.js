
exports.Then = jasmine.createSpy('Then').andCallFake(function(matcher, callback) {
        cucumberThens[matcher] = callback;
    });

exports.Given = jasmine.createSpy('Given').andCallFake(function(matcher, callback) {
        cucumberGivens[matcher] = callback;
    });

exports.setWindowSize = jasmine.createSpy('setting window size');

exports.getCssProperty = jasmine.createSpy('measure CSS property from browser instance').andCallFake(function(elementSelector, property, callback) {
        callback(null, 10);
    });
