export default class AlternatingMatrix {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    getMap() {
        const map = new Uint32Array(this.width * this.height);

        for (let i = 0; i < map.length; i++) {
            const row = Math.floor(i / this.width);
            const col = i % this.width;

            if ((row % 2) === 0) {
                map[i] = i;
            } else {
                map[i] = (row + 1) * this.width - (col + 1);
            }
        }

        return map;
    }

    getByCoordinate(x, y) {
        throw Error('not implemented yet');
    }
}
