/* CSS Steps Tests
 */

var CSSSteps, basedir;

basedir = '../../';

var mockery = require('mockery');

describe('CSS Imageutils Steps: ', function() {

	var worldMock, imageTestMock, selectorsMock, cucumberMock, cucumberThens, cucumberGivens, gmMock, assertMock;
    var console = jasmine.getGlobal().console;
	beforeEach(function() {
		worldMock = {}; // Might not need this
		eventsMock = {};
		colorsMock = {};
		colorlogMock = {};
		loggerMock = jasmine.createSpy('logger').andReturn(colorlogMock);
		configMock = jasmine.createSpy('config loader');

		imageTestMock = {
			init: jasmine.createSpy('initialising imageTest'),
			screenshot: jasmine.createSpy('taking screenshot')
		};
		gmImageUtilsMock = {
			isAvailable: jasmine.createSpy('is GraphicsMagick available').andCallFake(function(callback) {
				callback(false);
			}),
			cropImage: jasmine.createSpy('GM Utils cropImage'),
            compareImages: jasmine.createSpy('GM Utils compareImages')

        };

        gmMock = {
            crop: jasmine.createSpy('GM crop')
        };

		ghostImageUtilsMock = {
			isAvailable: jasmine.createSpy('initialising imageTest'),
			cropImage: jasmine.createSpy('Ghost Utils cropImage'),
            compareImages: jasmine.createSpy('Ghost Utils compareImages')
		};


		cucumberThens = [];
		cucumberGivens = [];
		cucumberMock = {
			'Then': jasmine.createSpy('Then').andCallFake(function(matcher, callback) {
				cucumberThens[matcher] = callback;
			}),
			'Given': jasmine.createSpy('Given').andCallFake(function(matcher, callback) {
				cucumberGivens[matcher] = callback;
			}),
			setWindowSize: jasmine.createSpy('setting window size'),
			getCssProperty: jasmine.createSpy('measure CSS property from browser instance').andCallFake(function(elementSelector, property, callback) {
				callback(null, 10);
			})
		};

		mockery.registerAllowable(basedir + 'features/step_definitions/css.js');
        mockery.registerMock('assert', './mocks/assert-mock');
		mockery.registerMock('../support/world.js', worldMock);
		mockery.registerMock('../support/gm-image-utils', gmImageUtilsMock);
		mockery.registerMock('../support/ghost-image-utils', ghostImageUtilsMock);
		mockery.registerMock('../support/imagetest', imageTestMock);
        mockery.registerSubstitute('../support/css-utils', basedir + "tests/spec/mocks/utils-mock.js");
        mockery.registerSubstitute('assert', './mocks/assert-mock.js');
        mockery.registerSubstitute('../support/selectors.js', basedir + 'tests/spec/mocks/selectors-mock.js');
		mockery.registerMock('events', eventsMock);
		mockery.registerMock('./colors', colorsMock);
		mockery.registerMock('../support/config.js', configMock);
		mockery.registerMock('../support/logger', loggerMock);
		mockery.registerMock('colorlog', colorlogMock);


		mockery.enable();
	});

	afterEach(function() {
		mockery.disable();
		mockery.deregisterAll();
	});

	describe('imageutil loading when GraphicsMagick is available', function() {
		beforeEach(function() {
			gmImageUtilsMock.isAvailable = jasmine.createSpy('is GraphicsMagick available').andCallFake(function(callback) {
				callback(true);
			});

			CSSSteps = require(basedir + 'features/step_definitions/css.js');

			CSSSteps.apply(cucumberMock);
		});

		it('should check for graphicsmagick', function() {
			expect(gmImageUtilsMock.isAvailable).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('should use graphicsmagick.cropImage', function() {
			cucumberThens['/^"([^"]*)" should look the same as before$/'].apply(cucumberMock);
			expect(imageTestMock.init).toHaveBeenCalledWith(jasmine.objectContaining({cropImage: gmImageUtilsMock.cropImage}));
		});

        it('should call graphicsmagick.compareImages', function() {
            cucumberThens['/^"([^"]*)" should look the same as before$/'].apply(cucumberMock);
            expect(imageTestMock.init).toHaveBeenCalledWith(jasmine.objectContaining({compareImages: gmImageUtilsMock.compareImages}));
        });
	});

	describe('imageutil loading when GraphicsMagick is not available', function() {
		beforeEach(function() {
			gmImageUtilsMock.isAvailable = jasmine.createSpy('is GraphicsMagick available').andCallFake(function(callback) {
				callback(false);
			});

			CSSSteps = require(basedir + 'features/step_definitions/css.js');

			CSSSteps.apply(cucumberMock);
		});
		it('should check for graphicsmagick', function() {
			expect(gmImageUtilsMock.isAvailable).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('should use ghostutils.cropImage', function() {
			cucumberThens['/^"([^"]*)" should look the same as before$/'].apply(cucumberMock);
			expect(imageTestMock.init).toHaveBeenCalledWith(jasmine.objectContaining({cropImage: ghostImageUtilsMock.cropImage}));
		});

        it('should use ghostutils.compareImages', function() {
            cucumberThens['/^"([^"]*)" should look the same as before$/'].apply(cucumberMock);
            expect(imageTestMock.init).toHaveBeenCalledWith(jasmine.objectContaining({compareImages: ghostImageUtilsMock.compareImages}));
        });
	});
});