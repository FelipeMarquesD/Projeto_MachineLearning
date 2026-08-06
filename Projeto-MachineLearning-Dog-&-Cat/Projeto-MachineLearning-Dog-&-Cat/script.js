// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
let lastPredictions = [];

// ---- utilidades de estilo ----
function iconForClass(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("gato") || n.includes("cat")) return "🐱";
    if (n.includes("cachorro") || n.includes("dog") || n.includes("cão") || n.includes("cao")) return "🐶";
    return "🐾";
}
function colorForClass(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("gato") || n.includes("cat")) return "#a78bfa";
    if (n.includes("cachorro") || n.includes("dog") || n.includes("cão") || n.includes("cao")) return "#fb923c";
    return "#2dd4bf";
}

// Load the image model and setup the webcam
async function init() {
    const startBtn = document.getElementById("start-btn");
    const statusText = document.getElementById("cam-status-text");
    startBtn.disabled = true;
    startBtn.querySelector(".start-btn-inner").textContent = "Iniciando…";
    statusText.textContent = "Carregando modelo…";

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }

        // ---- estado visual: ao vivo ----
        document.getElementById("cam-placeholder").style.display = "none";
        document.getElementById("cam-frame").classList.add("is-live");
        document.getElementById("scan-line").style.display = "block";
        document.getElementById("live-tag").style.display = "flex";
        document.getElementById("snap-btn").style.display = "inline-flex";
        document.getElementById("bars-hint").style.display = "none";
        startBtn.querySelector(".start-btn-inner").textContent = "Detectando…";
    } catch (e) {
        console.error(e);
        startBtn.disabled = false;
        startBtn.querySelector(".start-btn-inner").textContent = "✨ Tentar novamente";
        statusText.textContent = "Não foi possível abrir a câmera";
        document.getElementById("ph-icon");
        alert(
            "Não foi possível iniciar. Verifique se os arquivos do modelo estão na pasta /model e se você permitiu o acesso à câmera. Dica: rode em um servidor local (http), não abrindo o arquivo direto.",
        );
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    lastPredictions = [];
    for (let i = 0; i < maxPredictions; i++) {
        lastPredictions.push({
            className: prediction[i].className,
            probability: prediction[i].probability,
        });
    }
    renderPredictions(lastPredictions);
}

// ---- render bonito das predições ----
function renderPredictions(preds) {
    // barras
    for (let i = 0; i < preds.length; i++) {
        const p = preds[i];
        const pct = Math.round(p.probability * 100);
        const color = colorForClass(p.className);
        const node = labelContainer.childNodes[i];
        node.className = "bar-row";
        node.innerHTML =
            '<div class="bar-head">' +
            '<span class="bar-name" style="color:' + color + '">' + iconForClass(p.className) + " " + p.className + "</span>" +
            '<span class="bar-pct">' + pct + "%</span>" +
            "</div>" +
            '<div class="bar-track"><div class="bar-fill" style="background:' + color + ";width:" + pct + '%"></div></div>';
    }

    // veredito
    const best = [...preds].sort((a, b) => b.probability - a.probability)[0];
    if (best) {
        const color = colorForClass(best.className);
        const v = document.getElementById("verdict");
        v.classList.remove("verdict-empty");
        v.style.setProperty("--accent", color);
        document.getElementById("verdict-icon").textContent = iconForClass(best.className);
        document.getElementById("verdict-label").textContent = "Detectado";
        document.getElementById("verdict-name").textContent = best.className;
        document.getElementById("verdict-pct").textContent = Math.round(best.probability * 100) + "%";
    }
}

// ---- salvar foto com resultado sobreposto ----
function capturePhoto() {
    if (!webcam || !webcam.canvas) return;
    const best = lastPredictions.length
        ? [...lastPredictions].sort((a, b) => b.probability - a.probability)[0]
        : null;

    const size = 640;
    const banner = 120;
    const out = document.createElement("canvas");
    out.width = size;
    out.height = size + banner;
    const ctx = out.getContext("2d");

    ctx.drawImage(webcam.canvas, 0, 0, size, size);

    const grad = ctx.createLinearGradient(0, size, 0, size + banner);
    grad.addColorStop(0, "#150a24");
    grad.addColorStop(1, "#0a0a14");
    ctx.fillStyle = grad;
    ctx.fillRect(0, size, size, banner);

    const accent = best ? colorForClass(best.className) : "#2dd4bf";
    ctx.fillStyle = accent;
    ctx.font = "700 46px Fredoka, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(best ? best.className : "Sem detecção", 32, size + banner / 2 - 6);

    if (best) {
        ctx.fillStyle = "#f3f0ff";
        ctx.font = "600 40px Fredoka, sans-serif";
        const pct = Math.round(best.probability * 100) + "%";
        const w = ctx.measureText(pct).width;
        ctx.fillText(pct, size - w - 32, size + banner / 2 - 6);
    }

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "400 20px Outfit, sans-serif";
    ctx.fillText("Detector de Gato & Cachorro", 32, size + banner - 24);

    const link = document.createElement("a");
    link.download = "detector-pet-" + Date.now() + ".png";
    link.href = out.toDataURL("image/png");
    link.click();
}

// ---- alternar tema ----
document.getElementById("theme-toggle").addEventListener("click", function () {
    const light = document.body.classList.toggle("theme-light");
    document.getElementById("theme-icon").textContent = light ? "☀️" : "🌙";
});
