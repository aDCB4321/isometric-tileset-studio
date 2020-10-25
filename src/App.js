import React from 'react'
import './App.css';
import './Isometry';
import {ColorRgba, Painter, PolyhedronFactory, PolyhedronFactoryOptions, Stroke} from "./Isometry";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidMount() {
        let painter = new Painter(this.canvas.current)
        window.IsometricTool = {
            Painter: Painter,
            Factory: PolyhedronFactory,
            Options: PolyhedronFactoryOptions,
            painterInstance: painter
        }
        let poly = PolyhedronFactory.createCube(
            PolyhedronFactoryOptions.createQuickOptions(
                Math.floor(painter.getWidth() / 3), Math.floor(painter.getHeight() / 3),
                128, 128, 64,
                100, 1, '#569332'
            )
        )
        painter.putPolyhedron(poly)

        // v2 API
        let v2opts = {
            posX: Math.floor(painter.getWidth() / 2),
            posY: Math.floor(painter.getHeight() / 2),
            tileW: 64,
            tileH: 32,
            sizeX: 30,
            sizeZ: 30,
            sizeY: 40,
            rotation: 4,
            stroke: new Stroke(1, new ColorRgba('rgb(0,0,0)')).asInner(),
            baseColor: new ColorRgba('rgb(190,98,205)')
        }
        painter.drawIsometricCube(v2opts)
        painter.update()
        // document.getElementById("outp").innerText = painter.getWidth() + "," + painter.getHeight()
    }

    render() {
        return <div className="App">
            <header className="App-header">
                Isometric Tool
                <br/>
                <div className="isometry">
                    <canvas ref={this.canvas} width="600" height="400"/>
                </div>
                <div id="outp"></div>
            </header>
        </div>
    }
}

export default App;
