import React from 'react'
import './App.css';
import './Isometry';
import {Painter, PolyhedronFactory, PolyhedronFactoryOptions} from "./Isometry";

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
                64, 64, 32,
                100, 1, '#569332'
            )
        )
        painter.putPolyhedron(poly)
        painter.update()
        // document.getElementById("outp").innerText = painter.getWidth() + "," + painter.getHeight()
        painter.t_drawTopFace()
        painter.update()
    }

    render() {
        return <div className="App">
            <header className="App-header">
                Isometric Tool
                <br/>
                <div className="isometry">
                    <canvas ref={this.canvas} width="300" height="300"/>
                </div>
                <div id="outp"></div>
            </header>
        </div>
    }
}

export default App;
