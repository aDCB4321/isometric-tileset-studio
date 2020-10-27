import React from 'react'
import './App.scss';
import './Isometry';
import {ColorRgba, Painter, PolyhedronOptions, Stroke} from "./Isometry";

const defaults = new PolyhedronOptions(
    128, 128, 128, 64, 64, 64, 64, 0,
    new Stroke(1, ColorRgba.create(0, 0, 0, 255), true),
    new ColorRgba('rgb(27,250,172)')
)

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 640;

class Layer extends React.Component {
    index;
    options;
    canvasRef;

    constructor(props) {
        super(props);
        this.index = props.index
        this.options = props.options
        this.canvasRef = new React.createRef()
        this.onDraw = props.onDraw
    }

    componentDidMount() {
        if (!this.painter) {
            this.painter = new Painter(this.canvasRef.current);
        }
        this.draw()
        this.onDraw(this.options, this.index, this)
    }

    render() {
        return <div key={this.index} className="layer" style={{zIndex: this.index + 10}}>
            <canvas className={"editable-canvas"} ref={this.canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}/>
        </div>;
    }

    draw() {
        //this.painter.clearCanvas()
        this.painter.drawIsometricCube(this.options)
        this.painter.update()
    }
}

class App extends React.Component {
    updateCoolDownTimeout = null;
    updateTimeoutDelay = 100;
    viewportContainer;
    layersContainer;
    canvasGrid;
    keyCount = 0;

    constructor(props) {
        super(props);
        this.updateForm = this.updateForm.bind(this);
        this.handleInputNumChange = this.handleInputNumChange.bind(this);
        this.handleBaseColorChange = this.handleBaseColorChange.bind(this);
        this.handleStrokeColorChange = this.handleStrokeColorChange.bind(this);
        this.handleStrokeSizeChange = this.handleStrokeSizeChange.bind(this);
        this.handleZoomChange = this.handleZoomChange.bind(this);
        this.handleGridChange = this.handleGridChange.bind(this);
        this.addLayer = this.addLayer.bind(this);
        this.onLayerChange = this.onLayerChange.bind(this);
        this.handleGridSnapChange = this.handleGridSnapChange.bind(this);
        this.downloadLayers = this.downloadLayers.bind(this);
        this.copyLayers = this.copyLayers.bind(this);
        this.handlePosXChange = this.handlePosXChange.bind(this);
        this.handlePosYChange = this.handlePosYChange.bind(this);

        this.viewportContainer = React.createRef();
        this.layersContainer = React.createRef();
        this.canvasGrid = React.createRef();

        this.state = {
            zoom: 1.2,
            layers: [defaults],
            snapToGrid: true,
            currentLayer: 0,
        };
    }

    getCurrentOptions() {
        return this.state.layers[this.state.currentLayer]
    }

    updateForm(options, index) {
        //this.triggerPropsStateChange({currentLayer: index})
    }

    componentDidMount() {
        let opts = this.getCurrentOptions()
        this.drawGrid(opts.tileWidth, opts.tileHeight) // TODO: as component
        this.handleZoomChange({target: {value: this.state.zoom}})
        this.registerScrollOnDrag();// TODO: as component
    }

    render() {
        let makeLayerComboItems = () => {
            let opts = []
            for (let i = 0; i < this.state.layers.length; i++) {
                opts.push(<option key={i} value={i}>{i}</option>);
            }
            return opts
        };

        let makeLayers = () => {
            let layers = []
            for (let i = 0; i < this.state.layers.length; i++) {
                layers.push(this.createLayer(i, this.state.layers[i]));
            }
            return layers
        }

        let opts = this.getCurrentOptions()

        let snapMoveStepX = Math.floor(opts.tileWidth / 2)
        let snapMoveStepXHalf = Math.floor(snapMoveStepX / 2)
        let snapMoveStepY = Math.floor(opts.tileHeight / 2)

        let moveStepX = this.state.snapToGrid ? snapMoveStepX : 8
        let moveStepXHalf = Math.floor(moveStepX / 2)
        let moveStepY = this.state.snapToGrid ? snapMoveStepY : 8

        return <div className="ips-app">
            <header className="ips-menu ips-menu-top">
                <h1>Isometric Pixel Studio</h1>
            </header>
            <div className="ips-menu ips-menu-left">
                <div className="ips-form">
                    <div className="ips-form-group">
                        <header>Zoom: {Math.round(this.state.zoom * 10) * 10} %</header>
                        <label>
                            <input name="zoom" type="range" min={1} max={4} step={0.1}
                                   value={this.state.zoom} onChange={this.handleZoomChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Grid: {opts.tileWidth}x{opts.tileHeight}px</header>
                        <label>
                            Tile width:
                            <input name="tileWidth" type="range" min={0} max={320} step={8}
                                   value={opts.tileWidth} onChange={this.handleGridChange}/>
                        </label>
                        <label>
                            Tile height:
                            <input name="tileHeight" type="range" min={0} max={240} step={8}
                                   value={opts.tileHeight} onChange={this.handleGridChange}/>
                        </label>
                        <label>
                            Snap to grid:
                            <input style={{width: "30px"}} name="snapToGrid"
                                   type="checkbox" checked={this.state.snapToGrid === true} value={1}
                                   onChange={this.handleGridSnapChange}/>
                        </label>
                        <label>
                            Rotation ({opts.rotation}%):
                            <input name="rotation" type="range" min={-100} max={100} step={1}
                                   value={opts.rotation} onChange={this.handleGridChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Layers</header>
                        <label>
                            Current layer:
                            <select onChange={this.onLayerChange} name="layer" value={this.state.currentLayer}>
                                {makeLayerComboItems()}
                            </select>
                        </label>
                        <label>
                            <button name="addLayer" onClick={this.addLayer}>Add Layer</button>
                            <button name="removeLayer">Remove Layer</button>
                        </label>
                    </div>
                    <button className={"primary-btn"} name="copy" onClick={this.copyLayers}>Copy to clipboard</button>
                    <button className={"primary-btn"} name="download" onClick={this.downloadLayers}>Download</button>
                </div>
            </div>
            <div className="ips-viewport" ref={this.viewportContainer}>
                <div id={"ips_layers"} className="ips-layers" ref={this.layersContainer}>
                    {makeLayers()}
                    <div className="layer layer-grid" style={{zIndex: 1}}>
                        <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={this.canvasGrid}/>
                    </div>
                </div>
            </div>
            <div className="ips-menu ips-menu-right">
                <div className="ips-form">
                    <div className="ips-form-group">
                        <header>Position ({opts.posX},{opts.posY})</header>
                        <label>
                            X:
                            <input name="posX" type="range" min={0} max={CANVAS_WIDTH - snapMoveStepX} step={moveStepX}
                                   data-movestepy={moveStepY} value={opts.posX} onChange={this.handlePosXChange}/>
                        </label>
                        <label>
                            Y:
                            <input name="posY" type="range" min={0} max={CANVAS_HEIGHT - snapMoveStepY * 2}
                                   step={moveStepY} data-movestepx={moveStepX}
                                   value={opts.posY} onChange={this.handlePosYChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Size
                            ({opts.sizeX} x {opts.sizeZ} x {opts.sizeY})
                        </header>
                        <label>
                            X:
                            <input name="sizeX" type="range" min={0} max={CANVAS_WIDTH - snapMoveStepXHalf}
                                   step={moveStepXHalf}
                                   value={opts.sizeX} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Z:
                            <input name="sizeZ" type="range" min={0} max={CANVAS_WIDTH - snapMoveStepXHalf}
                                   step={moveStepXHalf}
                                   value={opts.sizeZ} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Y:
                            <input name="sizeY" type="range" min={0} max={CANVAS_HEIGHT - snapMoveStepXHalf}
                                   step={moveStepY}
                                   value={opts.sizeY} onChange={this.handleInputNumChange}/>
                        </label>
                    </div>
                    <div className="ips-form-group">
                        <header>Colors</header>
                        <label>
                            Base Color:
                            <input name="baseColor" type="color"
                                   value={opts.baseColor.toHexString()}
                                   onChange={this.handleBaseColorChange}/>
                        </label>
                        <label>
                            Stroke Color:
                            <input name="strokeColor" type="color"
                                   value={opts.stroke.color.toHexString()}
                                   onChange={this.handleStrokeColorChange}/>
                        </label>
                        <label>
                            Stroke Size:
                            <input name="strokeSize" type="range" min={0} max={10}
                                   value={opts.stroke.size} onChange={this.handleStrokeSizeChange}/>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    }

    onLayerChange(event) {
        this.triggerStateChange('currentLayer', parseInt(event.target.value))
    }

    createLayer(layerIndex, layerOpts) {
        let layer = <Layer key={layerIndex + "-" + this.keyCount}
                           onDraw={this.updateForm} index={layerIndex} options={layerOpts}/>
        this.keyCount++;
        return layer
    }

    addLayer() {
        let currOpts = this.state.layers[this.state.currentLayer]
        let layerOpts = Object.assign(
            {}, currOpts, {posY: currOpts.posY - currOpts.sizeY}
        );
        let layerIndex = this.state.layers.length
        let layers = this.state.layers
        layers.push(layerOpts)

        this.triggerPropsStateChange({
            layers: layers,
            currentLayer: layerIndex
        })
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

    triggerPropsStateChange(props, callback) {
        if (!callback) {
            callback = () => {
            }
        }
        this.setState(prevState => {
            let state = Object.assign({}, prevState, props);
            callback(state)
            return state
        });
    }

    triggerStateChange(propName, propValue, callback) {
        if (!callback) {
            callback = () => {
            }
        }
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state[propName] = propValue
            callback(state)
            return state
        });
    }

    triggerOptionsStateChange(propName, propValue, callback) {
        if (!callback) {
            callback = () => {
            }
        }
        callback.bind(this);
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state.layers[state.currentLayer][propName] = propValue
            callback(state)
            return state
        });
    }

    triggerOptionsStateChangeMultiple(opts, callback) {
        if (!callback) {
            callback = () => {
            }
        }
        callback.bind(this);
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state.layers[state.currentLayer] = Object.assign({}, state.layers[state.currentLayer], opts);
            callback(state)
            return state
        });
    }

    handlePosXChange(event) {
        let opts = this.getCurrentOptions()
        let val = parseInt(event.target.value)
        let valY = opts.posY
        if (val < this.getCurrentOptions().posX) {
            valY -= parseInt(event.target.dataset.movestepy)
        }else if (val > this.getCurrentOptions().posX) {
            valY += parseInt(event.target.dataset.movestepy)
        }
        this.triggerOptionsStateChangeMultiple({
            posX: val,
            posY: valY
        })
    }

    handlePosYChange(event) {
        let opts = this.getCurrentOptions()
        let val = parseInt(event.target.value)
        let valX = opts.posX
        if (val < this.getCurrentOptions().posY) {
            valX += parseInt(event.target.dataset.movestepx)
        }else if (val > this.getCurrentOptions().posY) {
            valX -= parseInt(event.target.dataset.movestepx)
        }
        this.triggerOptionsStateChangeMultiple({
            posX: valX,
            posY: val
        })
    }

    handleInputNumChange(event) {
        this.triggerOptionsStateChange(event.target.name, parseInt(event.target.value))
    }

    handleBaseColorChange(event) {
        this.triggerOptionsStateChange(event.target.name, new ColorRgba(event.target.value))
    }

    handleStrokeColorChange(event) {
        let stroke = this.state.layers[this.state.currentLayer].stroke
        stroke.color = new ColorRgba(event.target.value)
        this.triggerOptionsStateChange('stroke', stroke)
    }

    handleStrokeSizeChange(event) {
        let stroke = this.state.layers[this.state.currentLayer].stroke
        stroke.size = parseInt(event.target.value)
        this.triggerOptionsStateChange('stroke', stroke)
    }

    handleZoomChange(event) {
        let zoom = parseFloat(event.target.value)
        this.triggerStateChange('zoom', zoom, (state) => {
            this.layersContainer.current.style.zoom = state.zoom;
        })
    }

    handleGridChange(event) {
        this.setState(prevState => {
            let state = Object.assign({}, prevState);
            state.layers[state.currentLayer][event.target.name] = parseInt(event.target.value)
            let currOpts = state.layers[state.currentLayer]
            this.drawGrid(currOpts.tileWidth, currOpts.tileHeight)
            return state
        });
    }

    handleGridSnapChange(event) {
        this.triggerStateChange('snapToGrid', !!event.target.checked)
    }

    combineLayers() {
        let combined = document.createElement('canvas')
        combined.width = CANVAS_WIDTH
        combined.height = CANVAS_HEIGHT
        let ctx = combined.getContext('2d')
        let layers = document.getElementsByClassName('editable-canvas')
        Array.prototype.forEach.call(layers, function (canvas) {
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height)
        });
        return combined
    }

    copyLayers(event) {
        if (navigator.clipboard !== undefined && navigator.clipboard.write !== undefined) {
            let combined = this.combineLayers()
            // eslint-disable-next-line no-undef
            combined.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
        } else {
            this.downloadLayers(event)
        }
    }

    downloadLayers(event) {
        let combined = this.combineLayers()

        let dataURL = combined.toDataURL("image/png");
        let link = document.createElement('a');
        link.download = "isometric-studio-export.png";
        link.target = '_blank';
        link.href = dataURL // dataURL.replace("image/png", "image/octet-stream");
        link.click();
    }

    drawGrid(tileWidth, tileHeight) {
        const canvas = this.canvasGrid.current
        const c = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const gridNumX = 100
        const gridNumY = 100
        const lineColor = '#a6a6a6'

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
                c.fillStyle = lineColor
                c.fill()

                // left side od the tile
                c.beginPath()
                c.moveTo(-tileWidth / 2, tileHeight / 2 - this.z * tileHeight)
                c.lineTo(0, tileHeight - this.z * tileHeight)
                c.lineTo(0, tileHeight)
                c.lineTo(-tileWidth / 2, tileHeight / 2)
                c.closePath()
                c.fillStyle = lineColor
                c.fill()

                c.restore()
            }
        }

        const draw = function () {
            c.clearRect(0, 0, width, height)

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
