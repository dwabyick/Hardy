exports.equal = jasmine.createSpy('assert equal').andCallFake(function(a, b, message) {
        if (a === b) {
            return true;
        } else {
            throw new Error('Assertion error');
        }
    });


exports.ok = jasmine.createSpy('assert ok').andCallFake(function(a, message) {
        if (a) {
            return a;
        } else {
            throw new Error('Assertion error');
        }
    });
