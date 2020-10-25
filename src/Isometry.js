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

class Pixel {
    x;
    y;
    color;

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {ColorRgba} color
     */
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Stroke {
    size;
    color;
    inner = false;

    /**
     *
     * @param {number} size
     * @param {ColorRgba} color
     * @param {boolean} inner
     */
    constructor(size = 0, color = null, inner = false) {
        this.size = Math.floor(size ? size : 0)
        this.color = color ? color : TransparentColor
        this.inner = inner
    }

    asInner() {
        this.inner = true
        return this
    }

    asOuter() {
        this.inner = false
        return this
    }

    isDrawable() {
        return this.size > 0 || this.color.a > 0
    }
}

class Border {
    top;
    right;
    bottom;
    left;

    /**
     * @param {Stroke|null} top
     * @param {Stroke|null} right
     * @param {Stroke|null} bottom
     * @param {Stroke|null} left
     */
    constructor(top, right, bottom, left) {
        this.top = top ? top : new Stroke(0);
        this.right = right ? right : new Stroke(0);
        this.bottom = bottom ? bottom : new Stroke(0);
        this.left = left ? left : new Stroke(0);
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

    static create(x0, y0, x1, y1, strokeColor) {
        return new this(new Vector2(x0, y0), new Vector2(x1, y1), strokeColor, 1)
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
            base.desaturate(0.1).lighten(0.1),
            base.desaturate(0.4).lighten(0.4),
            new ColorRgba('#000000')
        )
    }
}

class PolyhedronFactoryOptions {
    position;
    size;
    angle;
    strokeWidth;
    colors;

    /**
     * @param {Vector2} position
     * @param {Vector3} size
     * @param {number} angle
     * @param {number} strokeWidth
     * @param {PolyhedronColorPalette} colors
     */
    constructor(position, size, angle, strokeWidth, colors) {
        this.position = position;
        this.size = size;
        this.angle = angle;
        this.strokeWidth = strokeWidth;
        this.colors = colors;
    }

    /**
     * @param {number} posX
     * @param {number} posY
     * @param {number} sizeX
     * @param {number} sizeZ
     * @param {number} sizeY
     * @param {number} angle
     * @param {number} strokeWidth
     * @param {ColorRgba|string} baseColor
     * @returns {PolyhedronFactoryOptions}
     */
    static createQuickOptions(posX, posY, sizeX, sizeZ, sizeY, angle, strokeWidth, baseColor) {
        return new this(
            new Vector2(posX, posY),
            new Vector3(sizeX, sizeY, sizeZ),
            angle,
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
        let rotation = (options.angle + 100 - options.strokeWidth) / (100 - options.strokeWidth)
        let size_x = options.size.x
        let size_z = options.size.z
        let size_y = options.size.y
        let size_yx = Math.floor(size_x / rotation)
        let size_yz = Math.floor(size_z / rotation)
        let pos = options.position
        let min_w = options.strokeWidth * 2
        let min_h = options.strokeWidth * 2

// CALC VERTICES
        let v = {}
        v.topLeft = new Vector2(pos.x, pos.y + min_h)
        v.topUp = new Vector2(pos.x + min_w, pos.y)
        v.topRight = new Vector2(pos.x + (min_w * 2), v.topLeft.y)
        v.topDown = new Vector2(v.topUp.x, pos.y + (min_h * 2))
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
     * @see http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
     * @param {Edge} edge
     */
    putEdge(edge) {
        let x0 = edge.from.x
        let y0 = edge.from.y
        let x1 = edge.to.x
        let y1 = edge.to.y

        let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        let err = (dx > dy ? dx : -dy) / 2;
        // TODO: support stroke width
        while (true) {
            this.putPixel(x0, y0, edge.strokeColor, 1)
            if (x0 === x1 && y0 === y1) break;
            let e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
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

    // https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
    isPositionInPolygon(x, y, vertices) {
        /* Determine if the point is in the path.

        Args:
          x -- The x coordinates of point.
          y -- The y coordinates of point.
          poly -- a list of tuples [(x, y), (x, y), ...]

        Returns:
          True if the point is in the path.
        */

        let verticesCount = vertices.length
        let j = verticesCount - 1
        let c = false
        for (let i = 0; i < verticesCount; i++) {
            if (((vertices[i][1] > y) !== (vertices[j][1] > y))
                && (x < vertices[i][0] + (vertices[j][0] - vertices[i][0]) *
                    (y - vertices[i][1]) / (vertices[j][1] - vertices[i][1]))) {

                c = !c
            }
            j = i
        }
        return c
    }

    /**
     *
     * @param {Vector2[]} vertices
     * @param {Border|null} borders
     * @param {ColorRgba|null} fillColor
     * @return {[[number, number]]}
     */
    drawPolygon(vertices, borders, fillColor = null) {
        if (borders === null && fillColor === null) {
            throw Error('Stroke and fill color cannot be both null.')
        }

        let ID_OUT_OF_POLYGON = 0,
            ID_OUTER_BORDER = 1,
            ID_INNER_BORDER = 2,
            ID_FILL = 3;

        // first, let's find the rect that we will have to scan pixel by pixel
        // by calculating the minimum and maximum positions of all vertices.

        let flatVertices = vertices.map((v) => [
            Math.floor(v.x),
            Math.floor(v.y)
        ])
        let xs = flatVertices.map((xy) => xy[0])
        let ys = flatVertices.map((xy) => xy[1])
        let minX = Math.min(...xs),
            maxX = Math.max(...xs),
            minY = Math.min(...ys),
            maxY = Math.max(...ys);
        let pixelMask = []

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                if (pixelMask[x] === undefined) {
                    pixelMask[x] = []
                }
                pixelMask[x][y] = ID_OUT_OF_POLYGON;
                if (!this.isPositionInPolygon(x, y, flatVertices)) {
                    //this.putPixel(x, y, strokeColor, 1) // this would be a negative mask
                    continue;
                }
                pixelMask[x][y] = ID_FILL;
                if (fillColor !== null) {
                    this.putPixel(x, y, fillColor, 1)
                }
            }
        }

        if (borders === null) {
            return pixelMask;
        }
        console.log(borders)
        // borders
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                if (pixelMask[x][y] < ID_FILL) {
                    continue;
                }
                // borders
                let neighbourPixels = [
                    //[x + stroke.size, y + stroke.size],
                    //[x - stroke.size, y - stroke.size],
                    //[x - stroke.size, y - stroke.size],
                    [x - borders.left.size, y, borders.left], // left border
                    [x, y - borders.top.size, borders.top], // top border
                    [x + borders.right.size, y, borders.right], // right border
                    [x, y + borders.bottom.size, borders.bottom], // bottom border
                    //[x - borders.left.size, y + borders.bottom.size, borders.bottom],
                    //[x + stroke.size, y - stroke.size]
                ];
                for (let i = 0; i < neighbourPixels.length; i++) {
                    let [bx, by, stroke] = neighbourPixels[i]

                    if (!stroke.isDrawable()) {
                        //continue;
                    }

                    if (pixelMask[bx] === undefined) {
                        pixelMask[bx] = []
                    }

                    if (pixelMask[bx][by] === undefined) {
                        pixelMask[bx][by] = ID_OUT_OF_POLYGON
                    }

                    if (pixelMask[bx][by] < ID_FILL) {
                        if (stroke.inner) {
                            pixelMask[bx][by] = ID_INNER_BORDER
                            this.putPixel(x, y, stroke.color, 1)
                        } else {
                            // TODO fix outer border corners
                            pixelMask[bx][by] = ID_OUTER_BORDER
                            this.putPixel(bx, by, stroke.color, 1)
                        }
                    }
                }
            }
        }

        return pixelMask
    }

    drawIsometricCube(opts) {
        let [tilew, tileh, size_x, size_y, size_z] = [
            opts.tileW, opts.tileH, opts.sizeX, opts.sizeY, opts.sizeZ
        ]

        let perspective = (tilew / tileh)
        let [rx, ry] = [opts.rotation, opts.rotation / perspective];

        // tilew += Math.max(rx,1)
        // tileh -= Math.max(ry,1)

        let [x, y, half_tilew, half_tileh] = [
            opts.posX, opts.posY - tileh / 2, tilew / 2, tileh / 2
        ];

        if (size_x < tilew) {
            size_x -= half_tilew
        }

        if (size_z < tilew) {
            size_z -= half_tilew
        }

        let size_yx = size_x / perspective
        let size_yz = size_z / perspective

        let noStroke = (new Stroke(0)).asInner()
        let lightStroke = noStroke
        if (!opts.stroke) {
            opts.stroke = noStroke
        }

        let topColor = null, leftColor = null, rightColor = null, lightStrokeColor = null;
        if (opts.baseColor) {
            let colorPalette = PolyhedronColorPalette.generate(opts.baseColor)
            topColor = colorPalette.base
            leftColor = colorPalette.dark
            rightColor = colorPalette.darker
            lightStrokeColor = colorPalette.light
        }
        if (opts.stroke.isDrawable()) {
            lightStroke = new Stroke(opts.stroke.size, lightStrokeColor, opts.stroke.inner)
        }

        // TOP face
        let topVertices = [
            new Vector2(x + rx, y + ry), // left
            new Vector2(x + half_tilew - rx, y - half_tileh + ry), // top
            new Vector2(x + tilew - rx, y - ry), // right
            new Vector2(x + half_tilew + rx, y + half_tileh - ry), // bottom
        ]

        // LEFT face
        let leftVertices = [
            new Vector2(x + rx, y + size_y + ry), // left,down
            topVertices[0], // left,top
            topVertices[3], // middle,top
            new Vector2(x + half_tilew + rx, y + (half_tileh) + size_y - ry), // middle,down
        ]

        // RIGHT face
        let rightVertices = [
            new Vector2(x + tilew - rx, y + size_y - ry), // right,down
            topVertices[2], // right.top
            topVertices[3], // middle,top
            leftVertices[3], // middle,down
        ]

        // apply size
        // Z
        topVertices[1].x += size_z
        topVertices[1].y -= (size_yz)
        topVertices[2].x += size_z
        topVertices[2].y -= (size_yz)
        rightVertices[0].x += size_z
        rightVertices[0].y -= (size_yz)


        topVertices[0].x -= size_x
        topVertices[0].y -= (size_yx)
        topVertices[1].x -= size_x
        topVertices[1].y -= (size_yx)
        leftVertices[0].x -= size_x
        leftVertices[0].y -= (size_yx)

        // // pyramid
        // topVertices = [
        //     topVertices[1],
        //     topVertices[1],
        //     topVertices[1],
        //     topVertices[1],
        // ]

        // // pyramid, inverted
        // leftVertices[0] = leftVertices[3]
        // rightVertices[0] = leftVertices[3]

        this.drawPolygon(
            topVertices,
            new Border(opts.stroke, lightStroke, lightStroke, lightStroke),
            topColor
        )
        this.drawPolygon(
            leftVertices,
            new Border(null, lightStroke, opts.stroke, opts.stroke),
            leftColor
        )
        this.drawPolygon(
            rightVertices,
            new Border(null, lightStroke, opts.stroke, null),
            rightColor
        )

        // Final outline fix "cell shading"
        opts.stroke.size *= 1
        this.drawPolygon(
            [
                topVertices[0], topVertices[1], topVertices[2],
                rightVertices[0], rightVertices[3],
                leftVertices[0],
            ],
            new Border(opts.stroke, opts.stroke, opts.stroke, opts.stroke),
            null
        )
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
    Painter,
    ColorRgba,
    Stroke
}
