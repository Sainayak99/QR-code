const cameraFeed = document.getElementById("video");
const frameCanvas = document.getElementById("canvas");
const ctx = frameCanvas.getContext("2d");
const scanButton = document.getElementById("start-btn");
const statusMsg = document.getElementById("status");
const resultContainer = document.getElementById("result=box");
const resultOutput = document.getElementById("result-text");

let scanning = false;
scanButton.addEventListener("click", function () {
    if (scanning) return;
    startScanner();
});

function startScanner() {
    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment"} } )
        .then(function (stream) {
            cameraFeed.srcObject = stream;
            cameraFeed.setAttribute("playsinline", true);
            cameraFeed.onplay();
            scanning = true;
            scanButton.disabled = true;
            scanButton.textContent = "Scanning...";
            statusMsg.textContent = "Point the camera at a QR code.";
            requestAnimationFrame(tick);
        })
        .catch(function (err) {
            statusMsg.textContent = "Camera access denied. Please allow camera permission.";
            console.error(err);
        });           
}

function tick() {
    if (cameraFeed.readyState === cameraFeed.HAVE_ENOUGH_DATA) {
        frameCanvas.width = cameraFeed.videoWidth;
        frameCanvas.height = cameraFeed.videoHeight;
        ctx.drawImage(cameraFeed, 0, 0, frameCanvas.width, frameCanvas.height);

        const imageData = ctx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
        const qrResult = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrResult) {
            statusMsg.textContent = "Qr code detected!";
            resultOutput.textContent = qrResult.data;
            resultContainer.classList.remove("hidden");
            stopScanner();
            return;
        }
    }
    requestAnimationFrame(tick);
}

function stopScanner() {
    scanning = false;
    scanButton.disabled = false;
    scanButton.textContent = "Scan Again";

    const stream = cameraFeed.srcObject;
    if (stream) {
        stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    cameraFeed.srcObject = null;
}