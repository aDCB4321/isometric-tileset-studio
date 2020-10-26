import React from 'react'
import './App.scss';
import './Isometry';
import {ColorRgba, Painter, PolyhedronOptions, Stroke} from "./Isometry";

const defaults = new PolyhedronOptions(
    256, 160, 128, 64, 64, 64, 64, 0,
    new Stroke(1, ColorRgba.create(0, 0, 0, 255), true),
    new ColorRgba('rgb(190,98,205,0.95)')
)

class App extends React.Component {
    /**
     * @property Painter
     */
    painter;
    updateCoolDownTimeout = null;
    updateTimeoutDelay = 100;
    canvas;
    layersContainer;
    viewportContainer;
    canvasGrid;

    constructor(props) {
        super(props);
        this.state = {zoom: 1.2, options: defaults};
        this.canvas = React.createRef();
        this.layersContainer = React.createRef();
        this.viewportContainer = React.createRef();
        this.canvasGrid = React.createRef();

        this.handleInputNumChange = this.handleInputNumChange.bind(this);
        this.handleBaseColorChange = this.handleBaseColorChange.bind(this);
        this.handleStrokeColorChange = this.handleStrokeColorChange.bind(this);
        this.handleStrokeSizeChange = this.handleStrokeSizeChange.bind(this);
        this.handleZoomChange = this.handleZoomChange.bind(this);
    }

    componentDidMount() {
        this.painter = new Painter(this.canvas.current)
        this.drawGrid()
        this.updateFigure(this.state.options)
        this.handleZoomChange({target: {value: this.state.zoom}})
        this.registerScrollOnDrag();
    }

    registerScrollOnDrag() {
        const el = this.viewportContainer.current;
        let isDown = false;
        let startX;
        let startY;
        let scrollLeft;
        let scrollTop;

        el.addEventListener("mousedown", e => {
            isDown = true;
            el.classList.add("active");
            startX = (e.pageX - el.offsetLeft)
            startY = (e.pageY - el.offsetTop);
            scrollLeft = el.scrollLeft;
            scrollTop = el.scrollTop;
        });

        el.addEventListener("mouseleave", () => {
            isDown = false;
            el.classList.remove("active");
        });

        el.addEventListener("mouseup", () => {
            isDown = false;
            el.classList.remove("active");
        });

        el.addEventListener("mousemove", e => {
            if (!isDown) {
                return;
            }
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const y = e.pageY - el.offsetTop;
            const walkX = x - startX;
            const walkY = y - startY;
            el.scrollLeft = scrollLeft - walkX;
            el.scrollTop = scrollTop - walkY;
        });
    }

    render() {
        return <div className="ips-app">
            <header className="ips-menu ips-menu-top">
                <h1>Isometric Pixel Studio</h1>
            </header>
            <div className="ips-menu ips-menu-left">
                <div className="ips-form">
                    <div className="ips-form-group">
                        <header>Zoom: {this.state.zoom * 100} %</header>
                        <label>
                            <input name="zoom" type="range" min={1} max={4} step={0.1}
                                   value={this.state.zoom} onChange={this.handleZoomChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Grid: {this.state.options.tileWidth}x{this.state.options.tileHeight}px</header>
                        <label>
                            Tile width:
                            <input name="tileWidth" type="range" min={0} max={320} step={8}
                                   value={this.state.options.tileWidth} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Tile height:
                            <input name="tileHeight" type="range" min={0} max={240} step={8}
                                   value={this.state.options.tileHeight} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Rotation ({this.state.options.rotation}%):
                            <input name="rotation" type="range" min={-100} max={100} step={1}
                                   value={this.state.options.rotation} onChange={this.handleInputNumChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Layers</header>
                        <label>
                            Current layer:
                            <select name="layer">
                                <option value={0}>0</option>
                            </select>
                        </label>
                        <label>
                            <button name="addLayer">Remove Layer</button>
                            <button name="addLayer">Add Layer</button>
                        </label>
                    </div>
                </div>
            </div>
            <div className="ips-viewport" ref={this.viewportContainer}>
                <div className="ips-layers" ref={this.layersContainer}>
                    <div className="layer" style={{zIndex: "2"}}>
                        <canvas width={640} height={480} ref={this.canvas}/>
                    </div>
                    <div className="layer layer-grid">
                        <canvas width={640} height={480} ref={this.canvasGrid}/>
                    </div>
                </div>
            </div>
            <div className="ips-menu ips-menu-right">
                <div className="ips-form">
                    <div className="ips-form-group">
                        <header>Position ({this.state.options.posX},{this.state.options.posY})</header>
                        <label>
                            X:
                            <input name="posX" type="range" min={0} max={320} step={8}
                                   value={this.state.options.posX} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Y:
                            <input name="posY" type="range" min={0} max={240} step={8}
                                   value={this.state.options.posY} onChange={this.handleInputNumChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Size
                            ({this.state.options.sizeX} x {this.state.options.sizeZ} x {this.state.options.sizeY})
                        </header>
                        <label>
                            X:
                            <input name="sizeX" type="range" min={0} max={200}
                                   value={this.state.options.sizeX} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Z:
                            <input name="sizeZ" type="range" min={0} max={200}
                                   value={this.state.options.sizeZ} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Y:
                            <input name="sizeY" type="range" min={0} max={200}
                                   value={this.state.options.sizeY} onChange={this.handleInputNumChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Colors</header>
                        <label>
                            Base Color:
                            <input name="baseColor" type="color"
                                   value={this.state.options.baseColor.toHexString()}
                                   onChange={this.handleBaseColorChange}/>
                        </label>
                        <label>
                            Stroke Color:
                            <input name="strokeColor" type="color"
                                   value={this.state.options.stroke.color.toHexString()}
                                   onChange={this.handleStrokeColorChange}/>
                        </label>
                        <label>
                            Stroke Size:
                            <input name="strokeSize" type="range" min={0} max={10}
                                   value={this.state.options.stroke.size} onChange={this.handleStrokeSizeChange}/>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    }

    updateFigure(options) {
        if (this.updateCoolDownTimeout === null) {
            this.updateCoolDownTimeout = setTimeout(() => {
                this.painter.clearCanvas()
                this.painter.drawIsometricCube(options)
                this.painter.update()
                this.updateCoolDownTimeout = null
            }, this.updateTimeoutDelay)
        }
    }

    triggerStateChange(propName, propValue, callback) {
        callback.bind(this);
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state[propName] = propValue
            callback(state)
            return state
        });
    }

    triggerOptionsStateChange(propName, propValue) {
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state.options[propName] = propValue
            this.updateFigure(state.options)
            return state
        });
    }

    handleInputNumChange(event) {
        this.triggerOptionsStateChange(event.target.name, parseInt(event.target.value))
    }

    handleBaseColorChange(event) {
        this.triggerOptionsStateChange(event.target.name, new ColorRgba(event.target.value))
    }

    handleStrokeColorChange(event) {
        let stroke = this.state.options.stroke
        stroke.color = new ColorRgba(event.target.value)
        this.triggerOptionsStateChange('stroke', stroke)
    }

    handleStrokeSizeChange(event) {
        let stroke = this.state.options.stroke
        stroke.size = parseInt(event.target.value)
        this.triggerOptionsStateChange('stroke', stroke)
    }

    handleZoomChange(event) {
        let zoom = parseFloat(event.target.value)
        this.triggerStateChange('zoom', zoom, (state) => {
            this.layersContainer.current.style.zoom = state.zoom;
        })
    }

    drawGrid() {
        const canvas = this.canvasGrid.current
        const c = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const tileWidth = this.state.options.tileWidth
        const tileHeight = this.state.options.tileHeight
        const gridNumX = 120
        const gridNumY = 120

        c.translate(width / 2, -height)

        const block = function (x, y, z) {
            this.x = x
            this.y = y
            this.z = z

            this.draw = function () {
                c.save()
                c.translate((this.x - this.y) * tileWidth / 2, (this.x + this.y) * tileHeight / 2)

                // Draw top of the tile
                c.beginPath()
                c.moveTo(0, -this.z * tileHeight)
                c.lineTo(tileWidth / 2, tileHeight / 2 - this.z * tileHeight)
                c.lineTo(0, tileHeight - z * tileHeight)
                c.lineTo(-tileWidth / 2, tileHeight / 2 - this.z * tileHeight)
                c.closePath()
                c.fillStyle = '#fff'
                c.fill()

                // right side of the tile
                c.beginPath()
                c.moveTo(tileWidth / 2, tileHeight / 2 - this.z * tileHeight)
                c.lineTo(0, tileHeight - this.z * tileHeight)
                c.lineTo(0, tileHeight)
                c.lineTo(tileWidth / 2, tileHeight / 2)
                c.closePath()
                c.fillStyle = '#000'
                c.fill()

                // left side od the tile
                c.beginPath()
                c.moveTo(-tileWidth / 2, tileHeight / 2 - this.z * tileHeight)
                c.lineTo(0, tileHeight - this.z * tileHeight)
                c.lineTo(0, tileHeight)
                c.lineTo(-tileWidth / 2, tileHeight / 2)
                c.closePath()
                c.fillStyle = '#000'
                c.fill()

                c.restore()
            }
        }

        const draw = function () {
            c.clearRect(-300, -100, width, height)

            for (let x = 0; x < gridNumX; x++) {
                for (let y = 0; y < gridNumY; y++) {
                    let item = new block(x, y, 1)
                    item.draw()
                }
            }
        }

        draw()
    }
}

export default App;
