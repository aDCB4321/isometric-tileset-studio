// GEOMETRY
import Color from 'color/index'

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
     * @param {Color|string} base
     * @param {Color|string} dark
     * @param {Color|string} darker
     * @param {Color|string} light
     * @param {Color|string} lighter
     * @param {Color|string} border
     */
    constructor(base, dark, darker, light, lighter, border) {
        this.base = Color(base);
        this.dark = Color(dark);
        this.darker = Color(darker);
        this.light = Color(light);
        this.lighter = Color(lighter);
        this.border = Color(border);
    }

    static generate(baseColor) {
        return new this(
            Color(baseColor),
            Color(baseColor).saturate(0.3).darken(0.1),
            Color(baseColor).saturate(0.3).darken(0.4),
            Color(baseColor).desaturate(0.2).lighten(0.2),
            Color(baseColor).desaturate(0.4).lighten(0.4),
            Color('#000000')
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
     * @param {Color|string} baseColor
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
        v.topDown = new Vector2(v.topUp.x, pos.x + tile_h)
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
        ed.topLeftTopUp = new Edge(v.topLeft, v.topUp, options.colors.borderOuter, bw)
        ed.topUpTopRight = new Edge(v.topUp, v.topRight, options.colors.borderOuter, bw)
        ed.topRightTopDown = new Edge(v.topRight, v.topDown, options.colors.borderInner, bw)
        ed.topDownTopLeft = new Edge(v.topDown, v.topLeft, options.colors.borderInner, bw)
        let topPoly = new Surface(
            options.colors.topSide,
            ed.topLeftTopUp,
            ed.topUpTopRight,
            ed.topRightTopDown,
            ed.topDownTopLeft
        )
        topPoly.center.x = Math.floor((v.topLeft.x + v.topRight.x) / 2)
        topPoly.center.y = Math.floor((v.topUp.y + v.topDown.y) / 2)

// left polygon
        ed.topLeftBottomLeft = new Edge(v.topLeft, v.bottomLeft, options.colors.borderOuter, bw)
        ed.topDownBottomDown = new Edge(v.topDown, v.bottomDown, options.colors.borderInner, bw)
        ed.bottomLeftBottomDown = new Edge(v.bottomLeft, v.bottomDown, options.colors.borderOuter, bw)
        let leftPoly = new Surface(
            options.colors.leftSide,

            ed.topDownTopLeft,
            ed.topLeftBottomLeft,
            ed.topDownBottomDown,
            ed.bottomLeftBottomDown
        )
        leftPoly.center.x = Math.floor((v.topLeft.x + v.topDown.x) / 2)
        leftPoly.center.y = Math.floor(((v.topLeft.y + v.bottomLeft.y) / 2) + (size_y / 2))

        ed.bottomRightBottomDown = new Edge(v.bottomRight, v.bottomDown, options.colors.borderOuter, bw)
        ed.topRightBottomRight = new Edge(v.topRight, v.bottomRight, options.colors.borderOuter, bw)
        let rightPoly = new Surface(
            options.colors.rightSide,

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
        this.#imageData = this.#ctx.getImageData(0, 0, this.getWidth(), this.getHeight())
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {Color}
     */
    getColorAt(x, y) {
        const red = y * (this.#imageData.width * 4) + x * 4;
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
            throw Error(err)
        }

        return Color.rgb(c.r, c.g, c.b).alpha(c.a / 255)
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
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isColorTransparentAt(x, y) {
        return this.getColorAt(x, y).a === 0
    }

    /**
     * @return {number}
     */
    getWidth() {
        return this.#canvas.width
    }

    /**
     * @return {number}
     */
    getHeight() {
        return this.#canvas.height
    }

    /**
     * @return {Area}
     */
    getSize() {
        return new Area(this.#canvas.width, this.#canvas.height)
    }

    clearCanvas() {
        this.#ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        this.#imageData = this.#ctx.getImageData(0, 0, this.getWidth(), this.getHeight())
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Color} color
     * @return {boolean}
     */
    setColorToCanvasPixel(x, y, color) {
        color = Color(color)
        let dx = Math.floor(x * this.getWidth());
        let dy = Math.floor(y * this.getHeight());
        let r = Math.floor(color.r * 256);
        let g = Math.floor(color.g * 256);
        let b = Math.floor(color.b * 256);
        let a = Math.floor(color.a * 256);

        let offset = (dy * this.#imageData.width + dx) * 4;
        this.#imageData.data[offset] = r;
        this.#imageData.data[offset + 1] = g;
        this.#imageData.data[offset + 2] = b;
        this.#imageData.data[offset + 3] = a;
    }

    // @param {CanvasImageData} imageData
    /**
     * @param {number} x
     * @param {number} y
     * @param {Color} color
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
     * @param {Vector2} pos
     * @param {Color|string} color
     */
    putFloodFill(pos, color) {
        if (this.isOutOfBounds(pos.x, pos.y) || !this.isColorTransparentAt(pos.x, pos.y)) {
            return
        }

        // this pixel is transparent, colorize it
        let ok = this.putPixel(pos.x, pos.y, color, 1)
        if (ok === false) {
            console.error(`Pixel out of bounds when filling: ${pos.x},${pos.y}`)
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
            this.putFloodFill(poly.surfaces[i].center, poly.surfaces[i].fillColor)
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
