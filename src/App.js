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
        let poly = PolyhedronFactory.createCube(
            PolyhedronFactoryOptions.createQuickOptions(
                Math.floor(painter.getWidth() / 3), Math.floor(painter.getHeight() / 3),
                20, 20, 20,
                64, 32,
                1, '#228bcb'
            )
        )
        console.log(poly)
        painter.putPolyhedron(poly)
        painter.update()
    }

    render() {
        return <div className="App">
            <header className="App-header">
                Isometric Tool
                <br/>
                <div className="isometry">
                    <canvas ref={this.canvas} width="640" height="640"/>
                </div>
            </header>
        </div>
    }
}

export default App;
