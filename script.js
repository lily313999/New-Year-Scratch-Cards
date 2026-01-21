/* =========================
   新年圖片刮刮樂 script.js
   改寫版：移除自動揭曉 + 動態卡池
   ========================= */

/* =========================
   圖片預載快取
   ========================= */

const imageCache = {};
let imagesLoaded = false;

function preloadImages(callback) {
  const allImages = [
    "img/cover.png",
    ...cardPool.common,
    ...cardPool.rare,
    ...cardPool.super
  ];

  let loaded = 0;

  allImages.forEach(src => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      loaded++;
      if (loaded === allImages.length) {
        imagesLoaded = true;
        console.log("✅ 所有刮刮卡圖片已預載完成");
        callback && callback();
      }
    };

    imageCache[src] = img;
  });
}


/* =========================
   🎁 動態卡池設定
   ========================= */

const cardPool = {
  common: [],  // 20張，機率總和 70%
  rare: [],    // 10張，機率總和 25%
  super: []    // 2張，機率總和 5%
};

// 動態產生卡片名稱（請自行替換成實際圖片路徑）
for (let i = 1; i <= 22; i++) cardPool.common.push(`img/common${i}.png`);
for (let i = 1; i <= 2; i++) cardPool.rare.push(`img/rare${i}.png`);
for (let i = 1; i <= 2; i++) cardPool.super.push(`img/super${i}.png`);

/* =========================
   Canvas & 全域變數
   ========================= */

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let revealed = false;

/* 刮刮參數 */
const BRUSH_SIZE = 60;
let scratchCount = 0;

/* 上一點 */
let lastX = null;
let lastY = null;

/* =========================
   遊戲流程
   ========================= */

function startGame() {
  const name = document.getElementById("nickname").value || "玩家";
  document.getElementById("playerName").innerText = `你好，${name}`;

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  newCard();
}

function weightedRandom() {
  const r = Math.random() * 100;

  let chosenPool;
  if (r < 70) {           // 70%
    chosenPool = cardPool.common;
  } else if (r < 95) {    // 25%
    chosenPool = cardPool.rare;
  } else {                // 5%
    chosenPool = cardPool.super;
  }

  const idx = Math.floor(Math.random() * chosenPool.length);
  return { img: chosenPool[idx] };
}

function newCard() {
  revealed = false;
  scratchCount = 0;
  lastX = lastY = null;

  canvas.style.display = "block";
  canvas.style.opacity = 1;

  const card = weightedRandom();

  // 🔥 使用預載圖片
  const prizeImg = document.getElementById("prizeImg");
  prizeImg.src = imageCache[card.img].src;

  setupCanvas();
}

/* =========================
   Canvas 初始化
   ========================= */

function setupCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  const cover = imageCache["img/cover.png"];

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(cover, 0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = BRUSH_SIZE;
}


/* =========================
   刮刮邏輯（線刮 + 金粉）
   ========================= */

function scratch(x, y) {
  if (revealed) return;

  if (lastX === null) {
    lastX = x;
    lastY = y;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  spawnGoldDustLine(lastX, lastY, x, y);

  lastX = x;
  lastY = y;

  scratchCount++;
  // ✅ 移除自動檢查全圖，不再呼叫 checkReveal()
}

/* =========================
   金粉效果（沿線）
   ========================= */

function spawnGoldDustLine(x1, y1, x2, y2) {
  const steps = Math.floor(
    Math.hypot(x2 - x1, y2 - y1) / 20
  );

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    createGoldDust(
      x1 + (x2 - x1) * t,
      y1 + (y2 - y1) * t
    );
  }
}

function createGoldDust(x, y) {
  const dust = document.createElement("div");
  dust.className = "dust";

  dust.style.left = (x + Math.random() * 20 - 10) + "px";
  dust.style.top = (y + Math.random() * 20 - 10) + "px";

  canvas.parentElement.appendChild(dust);
  setTimeout(() => dust.remove(), 500);
}

/* =========================
   滑鼠事件
   ========================= */

canvas.addEventListener("mousedown", e => {
  isDrawing = true;
  const r = canvas.getBoundingClientRect();
  lastX = e.clientX - r.left;
  lastY = e.clientY - r.top;
});

canvas.addEventListener("mouseup", resetDraw);
canvas.addEventListener("mouseleave", resetDraw);

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const r = canvas.getBoundingClientRect();
  scratch(e.clientX - r.left, e.clientY - r.top);
});

/* =========================
   觸控事件
   ========================= */

canvas.addEventListener("touchstart", e => {
  isDrawing = true;
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  lastX = t.clientX - r.left;
  lastY = t.clientY - r.top;
});

canvas.addEventListener("touchend", resetDraw);
canvas.addEventListener("touchcancel", resetDraw);

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!isDrawing) return;
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  scratch(t.clientX - r.left, t.clientY - r.top);
});

function resetDraw() {
  isDrawing = false;
  lastX = lastY = null;
}
