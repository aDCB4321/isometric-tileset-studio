import React from 'react'
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidMount() {
        var cs = this.canvas.current.getContext("2d")
        //size of grid is 2:1
        var gridWidth = 128
        var gridHeight = 64

        //sprite could be taller
        var spriteWidth = gridWidth
        var spriteHeight = img.height / img.width * gridWidth

        //always resize canvas with javascript. using CSS will make it stretch
        cs.width = window.innerWidth    //ie8>= doesn't have innerWidth/Height
        cs.height = window.innerHeight  //but they don't have canvas
        var ox = cs.width / 2 - spriteWidth / 2
        var oy = spriteHeight

        function renderImage(x, y) {
            c.drawImage(img, ox + (x - y) * spriteWidth / 2, oy + (y + x) * gridHeight / 2 - (spriteHeight - gridHeight), spriteWidth, spriteHeight)
        }

        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                renderImage(x, y)
            }
        }
    }

    render() {
        return <div className="App">
            <header className="App-header">
                hello
                <br/>
                <canvas id="isobox" ref={this.canvas} width="512" height="256"></canvas>
            </header>
        </div>
    }
}

export default App;
