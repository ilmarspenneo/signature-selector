import './App.css';
import React from "react";
import resizer from 'react-image-file-resizer';

type Props = {};
type State = {
    file: any
};

function calculateMaxSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Calculate the maximum width while maintaining aspect ratio
    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = (originalHeight * newWidth) / originalWidth;
    }

    // Calculate the maximum height while maintaining aspect ratio
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (originalWidth * newHeight) / originalHeight;
    }

    return {width: newWidth, height: newHeight};
}

class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            file: null
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({file: URL.createObjectURL(e.target.files[0])});
    }

    handleImageLoaded() {
        const img = document.getElementById("img") as HTMLImageElement;
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;

        if (!img || !canvas) {
            throw new Error("nocanvas!");
        }

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        let newSize;
        if (img.naturalWidth > 1600 || img.naturalHeight > 1600) {
            newSize = calculateMaxSize(
                img.naturalWidth,
                img.naturalHeight,
                800,
                800
            );
        } else {
            newSize = calculateMaxSize(
                img.naturalWidth,
                img.naturalHeight,
                600,
                600
            );
        }

        canvas.height = newSize.height;
        canvas.width = newSize.width;

        ctx.drawImage(img, 0, 0, newSize.width, newSize.height);
        const imgData = ctx.getImageData(0, 0, newSize.width, newSize.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            const count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
            const colour = count > 383 ? 255 : 0;

            imgData.data[i] = colour;
            imgData.data[i + 1] = colour;
            imgData.data[i + 2] = colour;
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    download() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const link = document.createElement('a');

        const fn = prompt('filename?' , window.navigator.userAgent);

        if (!fn) {
            return;
        }

        link.download = fn + '.jpeg';
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click()
    }

    render() {
        return (
            <div className="App">
                <input type="file" onChange={this.handleChange}/>
                <div></div>
                <img id="img" src={this.state.file} width="auto" height="300" style={{'display': 'none'}} alt="uploaded" onLoad={this.handleImageLoaded}/>
                <div></div>
                <canvas id="canvas"></canvas>
                <div></div>
                <input type="button" onClick={this.download} value="download!"/>
            </div>
        );
    }
}

export default App;