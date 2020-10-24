// GEOMETRY
import Color from 'color/index'

class ColorRgba {
    r;
    g;
    b;
    a;

    constructor(color) {
        if (color instanceof ColorRgba || (color.r !== undefined && color.a !== undefined)) {
            this.r = color.r
            this.g = color.g
            this.b = color.b
            this.a = color.a
        } else {
            let c = Color(color)
            this.r = Math.floor(c.red())
            this.g = Math.floor(c.green())
            this.b = Math.floor(c.blue())
            this.a = Math.floor(c.valpha * 255)
        }
    }

    static create(r, g, b, a) {
        return new this({r: r, g: g, b: b, a: a})
    }

    static equals(colorA, colorB) {
        return colorA.r === colorB.r && colorA.g === colorB.g
            && colorA.b === colorB.b && colorA.a === colorB.a;
    }


    darken(value) {
        return new ColorRgba(Color.rgb(this.r, this.g, this.b).alpha(this.a / 255).darken(value))
    }

    lighten(value) {
        return new ColorRgba(Color.rgb(this.r, this.g, this.b).alpha(this.a / 255).lighten(value))
    }

    saturate(value) {
        return new ColorRgba(Color.rgb(this.r, this.g, this.b).alpha(this.a / 255).saturate(value))
    }

    desaturate(value) {
        return new ColorRgba(Color.rgb(this.r, this.g, this.b).alpha(this.a / 255).desaturate(value))
    }

    toString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`
    }
}

const TransparentColor = ColorRgba.create(0, 0, 0, 0)

class Vector2 {
    x;
    y;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x},${this.y})`
    }
}


class Vector3 extends Vector2 {
    z;

    constructor(x = 0, y = 0, z = 0) {
        super(x, y);
        this.z = z;
    }

    toString() {
        return `(${this.x},${this.y},${this.z})`
    }
}

class Rect extends Vector2 {
    width;
    height;

    constructor(x = 0, y = 0, width = 0, height = 0) {
        super(x, y);
        this.width = width;
        this.height = height;
    }

    toString() {
        return `(${this.x},${this.y},${this.width}x${this.height})`
    }
}

class Area {
    width;
    height;

    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }

    toString() {
        return `(${this.width}x${this.height})`
    }
}

class Edge {
    from;
    to;
    strokeColor;
    strokeWidth;

    /**
     * @param {Vector2} from
     * @param {Vector2} to
     * @param {string} strokeColor
     * @param {number} strokeWidth
     */
    constructor(from, to, strokeColor, strokeWidth) {
        this.from = from;
        this.to = to;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
    }

    toString() {
        return `(${this.from} -> ${this.to}, ${this.strokeColor}, ${this.strokeWidth})`
    }
}

class Surface {
    edges;
    fillColor;
    center;

    /**
     * @param {string} fillColor
     * @param {Edge[]} edges
     */
    constructor(fillColor, ...edges) {
        this.edges = edges;
        this.fillColor = fillColor;
        this.center = new Vector2(0, 0)
    }

    toString() {
        let s = `(${this.center}, ${this.fillColor}):\n`
        for (let i in this.edges) {
            s += "##" + (i + 1) + this.edges[i] + "\n"
        }
        return s
    }
}

class Polyhedron {
    surfaces;

    /**
     * @param {Surface[]} surfaces
     */
    constructor(...surfaces) {
        this.surfaces = surfaces;
    }

    toString() {
        let s = `------`
        for (let i in this.surfaces) {
            s += "#" + (i + 1) + this.surfaces[i] + "\n---\n"
        }
        return s + `------`
    }
}

class PolyhedronColorPalette {
    base;
    dark;
    darker;
    light;
    lighter;
    border;

    /**
     * @param {ColorRgba} base
     * @param {ColorRgba} dark
     * @param {ColorRgba} darker
     * @param {ColorRgba} light
     * @param {ColorRgba} lighter
     * @param {ColorRgba} border
     */
    constructor(base, dark, darker, light, lighter, border) {
        this.base = new ColorRgba(base);
        this.dark = new ColorRgba(dark);
        this.darker = new ColorRgba(darker);
        this.light = new ColorRgba(light);
        this.lighter = new ColorRgba(lighter);
        this.border = new ColorRgba(border);
    }

    /**
     * @param {ColorRgba|string} baseColor
     * @return {PolyhedronColorPalette}
     */
    static generate(baseColor) {
        let base = new ColorRgba(baseColor)
        return new this(
            base,
            base.saturate(0.3).darken(0.1),
            base.saturate(0.3).darken(0.4),
            base.desaturate(0.2).lighten(0.2),
            base.desaturate(0.4).lighten(0.4),
            new ColorRgba('#000000')
        )
    }
}

class PolyhedronFactoryOptions {
    position;
    size;
    tileSize;
    strokeWidth;
    colors;

    /**
     * @param {Vector2} position
     * @param {Vector3} size
     * @param {Area} tileSize
     * @param {number} strokeWidth
     * @param {PolyhedronColorPalette} colors
     */
    constructor(position, size, tileSize, strokeWidth, colors) {
        this.position = position;
        this.size = size;
        this.tileSize = tileSize;
        this.strokeWidth = strokeWidth;
        this.colors = colors;
    }

    /**
     * @param {number} posX
     * @param {number} posY
     * @param {number} sizeX
     * @param {number} sizeZ
     * @param {number} sizeY
     * @param {number} tileWidth
     * @param {number} tileHeight
     * @param {number} strokeWidth
     * @param {ColorRgba|string} baseColor
     * @returns {PolyhedronFactoryOptions}
     */
    static createQuickOptions(posX, posY, sizeX, sizeZ, sizeY, tileWidth, tileHeight, strokeWidth, baseColor) {
        return new this(
            new Vector2(posX, posY),
            new Vector3(sizeX, sizeY, sizeZ),
            new Area(tileWidth, tileHeight),
            strokeWidth,
            PolyhedronColorPalette.generate(baseColor)
        )
    }
}

class PolyhedronFactory {
    /**
     * @param {PolyhedronFactoryOptions} options
     * @return Polyhedron
     */
    static createCube(options) {
        let tile_w = options.tileSize.width - options.strokeWidth // keeps borders inside the grid
        let tile_h = options.tileSize.height - options.strokeWidth
        let half_tile_w = Math.floor(tile_w / 2)
        let half_tile_h = Math.floor(tile_h / 2)
        let tile_aspect = tile_w / tile_h
        let size_x = options.size.x // - half_tile_w
        let size_z = options.size.z // - half_tile_w
        let size_y = options.size.y
        let size_yx = Math.floor(size_x / tile_aspect)
        let size_yz = Math.floor(size_z / tile_aspect)
        let pos = options.position

// CALC VERTICES
        let v = {}
        v.topLeft = new Vector2(pos.x, pos.y + half_tile_h)
        v.topUp = new Vector2(pos.x + half_tile_w, pos.y)
        v.topRight = new Vector2(pos.x + tile_w, v.topLeft.y)
        v.topDown = new Vector2(v.topUp.x, pos.y + tile_h)
        v.bottomLeft = new Vector2(v.topLeft.x, v.topLeft.y)
        v.bottomDown = new Vector2(v.topUp.x, v.topDown.y)
        v.bottomRight = new Vector2(v.topRight.x, v.topRight.y)

// apply lengths
        v.topUp.x = v.topUp.x + ((-1 * size_x) + size_z)
        v.topUp.y = v.topUp.y - (size_yx + size_yz)

// left
        v.topLeft.x = v.topLeft.x - size_x
        v.topLeft.y = v.topLeft.y - size_yx
        v.bottomLeft.x = v.bottomLeft.x - size_x
        v.bottomLeft.y = v.bottomLeft.y - size_yx

// right
        v.topRight.x = v.topRight.x + size_z
        v.topRight.y = v.topRight.y - size_yz
        v.bottomRight.x = v.bottomRight.x + size_z
        v.bottomRight.y = v.bottomRight.y - size_yz

// apply height (+Y)
        v.bottomLeft.y = v.bottomLeft.y + size_y
        v.bottomDown.y = v.bottomDown.y + size_y
        v.bottomRight.y = v.bottomRight.y + size_y

// CALC EDGES and POLYGONS with their center points
        let ed = {}
        let bw = options.strokeWidth

// top polygon
        ed.topLeftTopUp = new Edge(v.topLeft, v.topUp, options.colors.border, bw)
        ed.topUpTopRight = new Edge(v.topUp, v.topRight, options.colors.border, bw)
        ed.topRightTopDown = new Edge(v.topRight, v.topDown, options.colors.light, bw)
        ed.topDownTopLeft = new Edge(v.topDown, v.topLeft, options.colors.light, bw)
        let topPoly = new Surface(
            options.colors.base,
            ed.topLeftTopUp,
            ed.topUpTopRight,
            ed.topRightTopDown,
            ed.topDownTopLeft
        )
        topPoly.center.x = Math.floor((v.topLeft.x + v.topRight.x) / 2)
        topPoly.center.y = Math.floor((v.topUp.y + v.topDown.y) / 2)

// left polygon
        ed.topLeftBottomLeft = new Edge(v.topLeft, v.bottomLeft, options.colors.border, bw)
        ed.topDownBottomDown = new Edge(v.topDown, v.bottomDown, options.colors.light, bw)
        ed.bottomLeftBottomDown = new Edge(v.bottomLeft, v.bottomDown, options.colors.border, bw)
        let leftPoly = new Surface(
            options.colors.dark,
            ed.topDownTopLeft,
            ed.topLeftBottomLeft,
            ed.topDownBottomDown,
            ed.bottomLeftBottomDown
        )
        leftPoly.center.x = Math.floor((v.topLeft.x + v.topDown.x) / 2)
        leftPoly.center.y = Math.floor(((v.topLeft.y + v.bottomLeft.y) / 2) + (size_y / 2))

        ed.bottomRightBottomDown = new Edge(v.bottomRight, v.bottomDown, options.colors.border, bw)
        ed.topRightBottomRight = new Edge(v.topRight, v.bottomRight, options.colors.border, bw)
        let rightPoly = new Surface(
            options.colors.darker,
            ed.topRightTopDown,
            ed.topDownBottomDown,
            ed.topRightBottomRight,
            ed.bottomRightBottomDown
        )
        rightPoly.center.x = Math.floor((v.topRight.x + v.topDown.x) / 2)
        rightPoly.center.y = Math.floor(((v.topRight.y + v.bottomRight.y) / 2) + (size_y / 2))

        return new Polyhedron(topPoly, leftPoly, rightPoly)
    }
}

class Painter {
    /**
     * @property {HTMLCanvasElement} canvas
     */
    #canvas;

    /**
     * @property {ImageBitmapRenderingContext | CanvasRenderingContext2D }
     */
    #ctx;

    /**
     * @property {CanvasImageData | ImageData }
     */
    #imageData;

    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.#canvas = canvas
        this.#ctx = this.#canvas.getContext('2d')
        this.#imageData = this.#ctx.getImageData(
            0, 0, this.#canvas.width, this.#canvas.height
        )
    }

    getColorIndex(x, y) {
        //  // 4*y*canvas.width  +  4*x + 3
        return ((y * this.#imageData.width * 4) + (x * 4))
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {ColorRgba}
     */
    getColorAt(x, y) {
        const red = this.getColorIndex(x, y);
        const [redIndex, greenIndex, blueIndex, alphaIndex] = [red, red + 1, red + 2, red + 3];
        const c = {
            r: this.#imageData.data[redIndex],
            g: this.#imageData.data[greenIndex],
            b: this.#imageData.data[blueIndex],
            a: this.#imageData.data[alphaIndex]
        }

        if (c.r === undefined || c.g === undefined || c.b === undefined || c.a === undefined) {
            let err = "Pixel does not exist at " + new Vector2(x, y)
            console.error(err, c)
            return null
        }
        return new ColorRgba(c)
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isOutOfBounds(x, y) {
        return (x < 0) || (x > this.getWidth()) || (y < 0) || (y > this.getHeight())
    }

    /**
     * @return {number}
     */
    getWidth() {
        return this.#imageData.width
    }

    /**
     * @return {number}
     */
    getHeight() {
        return this.#imageData.height
    }

    /**
     * @return {Area}
     */
    getSize() {
        return new Area(this.#imageData.width, this.#imageData.height)
    }

    clearCanvas() {
        this.#ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        this.#imageData = this.#ctx.getImageData(0, 0, this.getWidth(), this.getHeight())
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {ColorRgba} color
     * @return {boolean}
     */
    setColorToCanvasPixel(x, y, color) {
        let offset = this.getColorIndex(x, y);
        this.#imageData.data[offset] = Math.floor(color.r);
        this.#imageData.data[offset + 1] = Math.floor(color.g);
        this.#imageData.data[offset + 2] = Math.floor(color.b);
        this.#imageData.data[offset + 3] = Math.floor(color.a);
    }

    // @param {CanvasImageData} imageData
    /**
     * @param {number} x
     * @param {number} y
     * @param {ColorRgba} color
     * @param {int} strokeWidth
     * @return {boolean}
     */
    putPixel(x, y, color, strokeWidth) {
        if (this.isOutOfBounds(x, y)) {
            return false
        }

        if (strokeWidth === 1) {
            this.setColorToCanvasPixel(x, y, color)
            return true
        }

        for (let tx = 0; tx <= strokeWidth - 1; tx++) {
            for (let ty = 0; ty <= strokeWidth - 1; ty++) {
                this.setColorToCanvasPixel(x + tx, y + ty, color)
            }
        }
    }

    /**
     * @param {Edge} edge
     */
    putEdge(edge) {
        let x1 = edge.from.x
        let y1 = edge.from.y
        let x2 = edge.to.x
        let y2 = edge.to.y

        let x, y, dx, dy, step, i;

        dx = (x2 - x1);
        dy = (y2 - y1);

        if (Math.abs(dx) >= Math.abs(dy)) {
            step = Math.abs(dx) // * edge.strokeWidth
        } else {
            step = Math.abs(dy) // * edge.strokeWidth
        }

        dx = dx / step;
        dy = dy / step;
        x = x1;
        y = y1;
        i = 1;

        while (i <= step) {
            let ok = this.putPixel(Math.floor(x), Math.floor(y), edge.strokeColor, edge.strokeWidth)
            if (ok === false) {
                console.error(`Pixel out of bounds when drawing a line: ${x},${y}`)
                break
            }
            x = x + dx;
            y = y + dy;
            i = i + 1;
        }
    }

    /**
     * Forest Fire Algorithm
     * https://en.wikipedia.org/wiki/Flood_fill#The_algorithm
     *
     * @param {number} x
     * @param {number} y
     * @param {ColorRgba} color Replacement color
     */
    putFloodFillQ(x, y, color) {
        let targetColor = TransparentColor
        if (this.isOutOfBounds(x, y) || ColorRgba.equals(color, targetColor)) {
            return
        }
        let pixelColor = this.getColorAt(x, y)
        if (pixelColor !== null && ColorRgba.equals(pixelColor, targetColor) === false) {
            return
        }

        this.setColorToCanvasPixel(x, y, color)

        /**
         * @type {Vector2[]}
         */
        let queue = []
        queue.push(new Vector2(x, y))

        while (queue.length > 0) {
            let node = queue.shift();
            [
                new Vector2(node.x - 1, node.y),
                new Vector2(node.x + 1, node.y),
                new Vector2(node.x, node.y + 1),
                new Vector2(node.x, node.y - 1)
            ].forEach((vec2) => {
                pixelColor = this.getColorAt(vec2.x, vec2.y)
                if (pixelColor !== null && ColorRgba.equals(pixelColor, targetColor)) {
                    this.setColorToCanvasPixel(vec2.x, vec2.y, color)
                    queue.push(new Vector2(vec2.x, vec2.y))
                }
            });
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {ColorRgba|string} color
     */
    putFloodFill2(x, y, color) {
        if (Math.floor(color.a) === 0) {
            console.warn("Fill a transparent")
            return;
        }
        let pixelData = this.#imageData
        if (x < 0 || y < 0 || x > pixelData.width || y > pixelData.height) {
            console.warn("Fill out of bounds")
            return;
        }
        let i = (y * pixelData.width + x) * 4;
        let pixels = pixelData.data;

        if (pixels[i + 3] === 0) { // fill if transparent
            pixels[i] = color.r;
            pixels[i + 1] = color.g;
            pixels[i + 2] = color.b;
            pixels[i + 3] = color.a;
            this.putFloodFill2(x - 1, y, color);
            this.putFloodFill2(x + 1, y, color);
            this.putFloodFill2(x, y - 1, color);
            this.putFloodFill2(x, y + 1, color);
        }
    }

    /**
     * @param {Vector2} pos
     * @param {ColorRgba|string} color
     */
    putFloodFill(pos, color) {
        if (this.isOutOfBounds(pos.x, pos.y)) {
            console.error(`Pixel out of bounds before filling: ${pos.x},${pos.y}`)
            return
        }
        if (!this.isColorTransparentAt(pos.x, pos.y)) {
            console.error(`Pixel out of bounds before filling 2: ${pos.x},${pos.y}`)
            return
        }

        // this pixel is transparent, colorize it
        let ok = this.putPixel(pos.x, pos.y, color, 1)
        if (ok === false) {
            console.error(`Pixel out of bounds after filling: ${pos.x},${pos.y}`)
            return
        }

        // do the same with the neighbor pixels
        this.putFloodFill(new Vector2(pos.x + 1, pos.y), color)
        this.putFloodFill(new Vector2(pos.x - 1, pos.y), color)
        this.putFloodFill(new Vector2(pos.x, pos.y + 1), color)
        this.putFloodFill(new Vector2(pos.x, pos.y - 1), color)

        //this.putFloodFill(Geometry:Vector2(pos.x - 1, pos.y - 1), color)
        //this.putFloodFill(Geometry:Vector2(pos.x - 1, pos.y + 1), color)
        //this.putFloodFill(Geometry:Vector2(pos.x + 1, pos.y + 1), color)
        //this.putFloodFill(Geometry:Vector2(pos.x + 1, pos.y - 1), color)
    }

    /**
     * @param {Surface} surface
     */
    putSurface(surface) {
        for (let i in surface.edges) {
            this.putEdge(surface.edges[i])
        }
    }

    /**
     * @param {Polyhedron} poly
     */
    putPolyhedron(poly) {
        for (let i in poly.surfaces) {
            this.putSurface(poly.surfaces[i])
        }
        for (let i in poly.surfaces) {
            let center = poly.surfaces[i].center
            this.putFloodFillQ(center.x, center.y, poly.surfaces[i].fillColor)
        }
    }

    update() {
        this.#ctx.putImageData(this.#imageData, 0, 0);
    }
}

export {
    Vector2,
    Vector3,
    Rect,
    Area,
    Edge,
    Polyhedron,
    Surface,
    PolyhedronFactory,
    PolyhedronFactoryOptions,
    PolyhedronColorPalette,
    Painter
}
