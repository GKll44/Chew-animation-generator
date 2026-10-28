const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FPS = 30;
const FRAME_INTERVAL = 1000 / FPS;

const ampInput = document.getElementById("amp");
const speedInput = document.getElementById("speed");
const biteXInput = document.getElementById("biteX");
const biteYInput = document.getElementById("biteY");

const personXInput = document.getElementById("personX");
const personYInput = document.getElementById("personY");
const mouthXInput = document.getElementById("mouthX");
const mouthYInput = document.getElementById("mouthY");
const cookieXInput = document.getElementById("cookieX");
const cookieYInput = document.getElementById("cookieY");

const exportBtn = document.getElementById("exportGif");

const filePerson = document.getElementById("imgPerson");
const fileMouth = document.getElementById("imgMouth");
const fileCookie = document.getElementById("imgCookie");

let amp = Number(ampInput.value);
let speed = Number(speedInput.value);
let biteX = Number(biteXInput.value);
let biteY = Number(biteYInput.value);

let personOffsetX = Number(personXInput.value);
let personOffsetY = Number(personYInput.value);
let mouthOffsetX = Number(mouthXInput.value);
let mouthOffsetY = Number(mouthYInput.value);
let cookieOffsetX = Number(cookieXInput.value);
let cookieOffsetY = Number(cookieYInput.value);

let t = 0;
let lastTime = 0;
let accumulator = 0;

let personImg = null;
let mouthImg = null;
let cookieImg = null;

const cookieCanvas = document.createElement("canvas");
cookieCanvas.width = 120;
cookieCanvas.height = 120;
const cookieCtx = cookieCanvas.getContext("2d");

ampInput.oninput = () => { amp = Number(ampInput.value); };
speedInput.oninput = () => { speed = Number(speedInput.value); };
biteXInput.oninput = () => {
  biteX = Number(biteXInput.value);
  updateCookieBite();
};
biteYInput.oninput = () => {
  biteY = Number(biteYInput.value);
  updateCookieBite();
};

personXInput.oninput = () => { personOffsetX = Number(personXInput.value); };
personYInput.oninput = () => { personOffsetY = Number(personYInput.value); };
mouthXInput.oninput = () => { mouthOffsetX = Number(mouthXInput.value); };
mouthYInput.oninput = () => { mouthOffsetY = Number(mouthYInput.value); };
cookieXInput.oninput = () => { cookieOffsetX = Number(cookieXInput.value); };
cookieYInput.oninput = () => { cookieOffsetY = Number(cookieYInput.value); };

exportBtn.onclick = exportGif;

async function loadFileAsBitmap(file) {
  try {
    return await createImageBitmap(file);
  } catch (err) {
    console.warn("createImageBitmap 失败，回退到 Image：", err);
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    };
    img.onerror = (e) => {
      console.error("图片加载失败：", e);
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

filePerson.onchange = async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const bmp = await loadFileAsBitmap(f);
  if (bmp) {
    personImg = bmp;
    drawScene();
  } else {
    alert("人物图读取失败，请换一张图片试试。");
  }
};

fileMouth.onchange = async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const bmp = await loadFileAsBitmap(f);
  if (bmp) {
    mouthImg = bmp;
    drawScene();
  } else {
    alert("嘴巴图读取失败，请换一张图片试试。");
  }
};

fileCookie.onchange = async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const bmp = await loadFileAsBitmap(f);
  if (bmp) {
    cookieImg = bmp;
    updateCookieBite();
    drawScene();
  } else {
    alert("饼干图读取失败，请换一张图片试试。");
  }
};

function drawCookieBase() {
  cookieCtx.imageSmoothingEnabled = false;

  // ✅ 关键修复：先清空离屏 canvas，避免上一张贴图的像素残留
  cookieCtx.clearRect(0, 0, cookieCanvas.width, cookieCanvas.height);

  if (cookieImg) {
    cookieCtx.drawImage(cookieImg, 0, 0, 120, 120);
  } else {
    cookieCtx.fillStyle = "#f4d58a";
    cookieCtx.fillRect(0, 0, 120, 120);
    cookieCtx.strokeStyle = "#c99a54";
    cookieCtx.lineWidth = 2;
    cookieCtx.strokeRect(0, 0, 120, 120);
  }
}

function applyBiteMask() {
  cookieCtx.globalCompositeOperation = "destination-out";
  cookieCtx.beginPath();
  cookieCtx.arc(biteX, biteY, 32, 0, Math.PI * 2);
  cookieCtx.fill();
  cookieCtx.globalCompositeOperation = "source-over";
}

function updateCookieBite() {
  drawCookieBase();
  applyBiteMask();
}

function drawScene() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const personX = personOffsetX;
  const personY = personOffsetY;
  const cookieDrawX = 120 + cookieOffsetX;
  const cookieDrawY = 120 + cookieOffsetY;

  if (personImg) {
    ctx.drawImage(personImg, personX, personY, 130, 240);
  }

  ctx.drawImage(cookieCanvas, cookieDrawX, cookieDrawY, 120, 120);

  const mouthCenterX = 70 + mouthOffsetX;
  const mouthCenterY = 120 + mouthOffsetY;
  const angle = t * 0.06 * (speed / 50);
  const mouthX = mouthCenterX + amp * Math.cos(angle);
  const mouthY = mouthCenterY + amp * Math.sin(angle);

  if (mouthImg) {
    ctx.drawImage(mouthImg, mouthX - 20, mouthY - 10, 20, 18);
  }
}

function loop(now) {
  if (!lastTime) lastTime = now;
  const delta = now - lastTime;
  lastTime = now;
  accumulator += delta;

  while (accumulator >= FRAME_INTERVAL) {
    drawScene();
    t++;
    accumulator -= FRAME_INTERVAL;
  }
  requestAnimationFrame(loop);
}

/**
 * 导出 GIF
 */
function exportGif() {
  if (typeof GIF === "undefined") {
    alert("gif.js 未加载成功，请检查网络后刷新页面。");
    return;
  }

  // 🌟 自动计算转一周（2π）所需的帧数
  // 角度公式为: angle = t * 0.06 * (speed / 50)
  // 转一圈所需帧数: (2 * Math.PI) / (0.06 * (speed / 50))
  const cycleFrames = (2 * Math.PI) / (0.06 * (speed / 50));
  const frames = Math.max(4, Math.round(cycleFrames)); // 最少 4 帧，并四舍五入取整

  console.log(`当前速度下，转一圈需要 ${frames} 帧`);
  
  exportBtn.disabled = true;
  exportBtn.textContent = "导出中…";

  const remoteWorkerUrl = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js";
  let localWorkerUrl = "";
  let gif = null;

  try {
    const blobCode = `importScripts('${remoteWorkerUrl}');`;
    const blob = new Blob([blobCode], { type: "text/javascript" });
    localWorkerUrl = URL.createObjectURL(blob);

    gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: localWorkerUrl
    });

    gif.on("abort", () => {
      exportBtn.disabled = false;
      exportBtn.textContent = "导出 GIF";
      alert("GIF 导出被中断。");
      if (localWorkerUrl) URL.revokeObjectURL(localWorkerUrl);
    });

    gif.on("finished", (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chew_animation.gif";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (localWorkerUrl) URL.revokeObjectURL(localWorkerUrl);
      
      exportBtn.disabled = false;
      exportBtn.textContent = "导出 GIF";
    });

    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tmpCtx = tmp.getContext("2d", { willReadFrequently: true });

    for (let i = 0; i < frames; i++) {
      drawScene();
      
      tmpCtx.fillStyle = "#ffffff";
      tmpCtx.fillRect(0, 0, tmp.width, tmp.height);
      tmpCtx.drawImage(canvas, 0, 0);
      
      const imgData = tmpCtx.getImageData(0, 0, tmp.width, tmp.height);
      const data = imgData.data;
      for (let j = 3; j < data.length; j += 4) {
        data[j] = 255; 
      }
      
      gif.addFrame(imgData, { copy: true, delay: Math.round(1000 / FPS) });
      t++;
    }

    gif.render();
  } catch (err) {
    console.error("导出失败：", err);
    alert("导出失败：" + (err && err.message ? err.message : err));
    exportBtn.disabled = false;
    exportBtn.textContent = "导出 GIF";
    if (localWorkerUrl) URL.revokeObjectURL(localWorkerUrl);
  }
}

function loadImageSrc(src) {
  return new Promise(resolve => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

async function start() {
  const [prs, mou, coo] = await Promise.all([
    loadImageSrc("prs.png"),
    loadImageSrc("mouth.png"),
    loadImageSrc("cookie.png")
  ]);
  if (!personImg) personImg = prs;
  if (!mouthImg) mouthImg = mou;
  if (!cookieImg) cookieImg = coo;

  updateCookieBite();
  requestAnimationFrame(loop);
}

start();