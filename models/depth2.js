

import { pipeline, env, RawImage } from 'transformers';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

// Proxy the WASM backend to prevent the UI from freezing
env.backends.onnx.wasm.proxy = true;

// Constants
const EXAMPLE_URL = '../images/depthexample.jpeg';
const DEFAULT_SCALE = 0.75;

// Reference the elements that we will need
const status = document.getElementById('status');
const fileUpload = document.getElementById('upload');
const imageContainer = document.getElementById('container');
const example = document.getElementById('example');

// Create a new depth-estimation pipeline
status.textContent = 'Cargando modelo...';
const depth_estimator = await pipeline('depth-estimation', 'Xenova/depth-anything-small-hf');
status.textContent = 'Listo';

example.addEventListener('click', (e) => {
    e.preventDefault();
    predict(EXAMPLE_URL);
});

fileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = e2 => predict(e2.target.result);

    reader.readAsDataURL(file);
});

let onSliderChange;

// Predict depth map for the given image
async function predict(url) {
    imageContainer.innerHTML = '';
    const image = await RawImage.fromURL(url);


    const { canvas, context } = setupScene(image.width, image.height * 2); // Asegúrate de que el canvas es el doble de alto para ajustar ambas imágenes
    imageContainer.append(canvas);

    status.textContent = 'Analizando...';
    const { depth } = await depth_estimator(image);


    const blob = await depth.toCanvas().convertToBlob();
    const imageUrl = URL.createObjectURL(blob);
    const depthImage = new Image();
    depthImage.src = imageUrl;

    await new Promise(resolve => {
        depthImage.onload = resolve;
    });

    const originalImage = new Image();
    originalImage.src = url;


    await new Promise(resolve => {
        originalImage.onload = resolve;
    });

    drawImages(context, originalImage, depthImage, 0);
    setupSlider(canvas, context, originalImage, depthImage)


    status.textContent = '';
}

function setupScene(w, h) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    return { canvas, context };
}

let sliderValue = 0.5; // Global variable to keep track of the slider position

function drawImages(context, originalImage, depthImage, sliderValue) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    context.clearRect(0, 0, width, height * 2);

    context.drawImage(originalImage, 0, 0, width, height);

    context.save();
    context.beginPath();
    context.rect(width * sliderValue, 0, width, height);
    context.clip();
    context.drawImage(depthImage, 0, 0, width, height);
    context.restore();

    // Draw the slider line
    context.beginPath();
    context.moveTo(width * sliderValue, 0);
    context.lineTo(width * sliderValue, height);
    context.strokeStyle = 'cyan'; 
    context.lineWidth = 3; 
    context.stroke();
}

function setupSlider(canvas, context, originalImage, depthImage) {
    let isDragging = false;

    const onMouseDown = (e) => {
        isDragging = true;
        updateSlider(e, canvas,originalImage, depthImage);
    };

    const onMouseMove = (e) => {
        if (isDragging) {
            updateSlider(e, canvas,originalImage, depthImage);
        }
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp); 

    return () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mouseleave', onMouseUp);
    };
}



// Update the slider position
function updateSlider(e, canvas,originalImage, depthImage) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    sliderValue = x / (rect.right - rect.left);
    sliderValue = Math.max(Math.min(sliderValue, 1), 0);


    const context = canvas.getContext('2d');
    drawImages(context, originalImage, depthImage, sliderValue);
}
