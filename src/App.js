import React from 'react'
import './App.scss';
import './Isometry';
import {ColorRgba, Painter, PolyhedronOptions, Stroke} from "./Isometry";

const defaults = new PolyhedronOptions(
    304, 168, 128, 64, 64, 64, 64, 0,
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

    constructor(props) {
        super(props);
        this.state = {zoom: 1.2, options: defaults};
        this.canvas = React.createRef();
        this.layersContainer = React.createRef();
        this.viewportContainer = React.createRef();

        this.handleInputNumChange = this.handleInputNumChange.bind(this);
        this.handleBaseColorChange = this.handleBaseColorChange.bind(this);
        this.handleStrokeColorChange = this.handleStrokeColorChange.bind(this);
        this.handleStrokeSizeChange = this.handleStrokeSizeChange.bind(this);
        this.handleZoomChange = this.handleZoomChange.bind(this);
    }

    componentDidMount() {
        this.painter = new Painter(this.canvas.current)
        this.updateFigure(this.state.options)
        this.handleZoomChange({target: {value: this.state.zoom}})
        this.registerScrollOnDrag();
    }

    registerScrollOnDrag() {
        const el = this.canvas.current;
        let isDown = false;
        let startX;
        let startY;
        let scrollLeft;
        let scrollTop;

        // function calculateDistance(elem, mouseX, mouseY) {
        //     return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.offset().left+(elem.width()/2)), 2)
        //         + Math.pow(mouseY - (elem.offset().top+(elem.height()/2)), 2)));
        // }
        //
        // $(document).mousemove(function(e) {
        //     mX = e.pageX;
        //     mY = e.pageY;
        //     distance = calculateDistance($element, mX, mY);
        //     $distance.text(distance);
        // });
        //
        el.addEventListener("mousedown", e => {
            isDown = true;
            el.classList.add("active");
            scrollTop = (e.pageY - el.offsetTop)
            scrollLeft = (e.pageX - el.offsetLeft)
            startX = this.state.options.posX;
            startY = this.state.options.posY;
            //scrollLeft = el.scrollLeft;
            //scrollTop = el.scrollTop;
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
            let walkX = scrollLeft - (e.pageX - el.offsetLeft);
            let walkY = scrollTop - (e.pageY - el.offsetTop);
            console.log(walkX,walkY)
            //console.log(walkX,walkY)
            if (Math.abs(walkX) < 8 && Math.abs(walkY) < 8) {
                return
            }
            walkX = Math.sign(walkX) * 8;
            walkY = Math.sign(walkY) * 8;
            this.triggerOptionsStateChange('posX', this.state.options.posX - walkX)
            //this.triggerOptionsStateChange('posY', this.state.options.posY - walkY)
            //el.scrollLeft = scrollLeft - walkX;
            //el.scrollTop = scrollTop - walkY;
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
                        <header>Grid ({this.state.options.tileWidth} x {this.state.options.tileHeight})</header>
                        <label>
                            Tile Width:
                            <input name="tileWidth" type="range" min={0} max={320} step={8}
                                   value={this.state.options.tileWidth} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Tile Height:
                            <input name="tileHeight" type="range" min={0} max={240} step={8}
                                   value={this.state.options.tileHeight} onChange={this.handleInputNumChange}/>
                        </label>
                        <label>
                            Rotation ({this.state.options.rotation}):
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
                        <header>Zoom ({this.state.zoom})</header>
                        <label>
                            <input name="zoom" type="range" min={1} max={4} step={0.1}
                                   value={this.state.zoom} onChange={this.handleZoomChange}/>
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
}

export default App;
