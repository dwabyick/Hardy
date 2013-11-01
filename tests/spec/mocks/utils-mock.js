module.exports = {
    isColor: jasmine.createSpy('initialising imageTest').andReturn(true),
    toRgba: jasmine.createSpy('convert to RGBa').andCallFake(function(a) {
        return a;
    }),
    normalizeString: jasmine.createSpy('normalizing CSS values').andCallFake(function(a) {
        return a;
    })
};