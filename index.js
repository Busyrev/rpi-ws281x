let path = require("path");
let addon = require(path.join(__dirname, "build", "Release", "rpi-ws281x.node"));

class Module {
    constructor() {
        this.map = undefined;
        this.leds = undefined;
    }

    configure(options) {
        var {width, height, map, leds, ...options} = options;

        if (width !== undefined || height !== undefined) {

            if (width === undefined) {
                throw new Error('Must specify width if height is specified.');
            }

            if (height === undefined) {
                throw new Error('Must specify height if width is specified.');
            }

            if (leds !== undefined) {
                throw new Error('Please do not specify leds when both width and height are specified.');
            }

            leds = width * height;

            if (typeof map === 'string') {
                if (map === 'matrix') {
                    map = new Uint32Array(width * height);

                    for (let i = 0; i < map.length; i++) {
                        map[i] = i;
                    }
                } else if (map === 'alternating-matrix') {
                    map = new Uint32Array(width * height);

                    for (let i = 0; i < map.length; i++) {
                        let row = Math.floor(i / width), col = i % width;

                        if ((row % 2) === 0) {
                            map[i] = i;
                        } else {
                            map[i] = (row + 1) * width - (col + 1);
                        }
                    }
                } else if (map === 'serpentine-matrix') {
                    map = new Uint32Array(width * height);
                    for (let i = 0; i < map.length; i++) {
                        let row = Math.floor(i / height);

                        let target = i;

                        if (row % 2 === 1) {
                            target = (row * height) - i + ((row + 1) * height) - 1;
                        }

                        map[i] = target;
                    }
                } else if (map === 'canvas-matrix') {
                    map = new Uint32Array(width * height);
                    for (let i = 0; i < map.length; i++) {
                        let row = Math.floor(i / height);
                        let col = height - (i % height) - 1;

                        let target = i * width;

                        if (row % 2 === 1) {
                            target = width * col + row;
                        }

                        map[i] = target;
                    }
                }
            }
        }

        // Make sure the number of leds are specified
        if (leds === undefined) {
            throw new Error('Number of leds must be defined. Either by leds or by width and height.');
        }

        // If no map specified, create a default one...
        if (map === undefined) {
            map = new Uint32Array(leds);

            for (let i = 0; i < leds; i++) {
                map[i] = i;
            }
        }

        // Make sure we have a correct instance of pixel mapping
        if (!(map instanceof Uint32Array))
            throw new Error('Pixel mapping must be an Uint32Array.');

        if (map.length !== leds)
            throw new Error('Pixel mapping array must be of the same size as the number of leds.');

        this.map = map;
        this.leds = leds;

        addon.configure({...options, leds: leds});
    }

    reset() {
        if (this.leds !== undefined) {
            this.render(new Uint32Array(this.leds));
            addon.reset();
        }
    }

    sleep(ms) {
        addon.sleep(ms);
    }

    render(pixels) {
        if (this.map !== undefined)
            addon.render(pixels, this.map);
    }
}

module.exports = new Module();
