/* =========================
   新年圖片刮刮樂 script.js
   指定暱稱必中版
   ========================= */

/* =========================
   指定暱稱設定（⭐ 可擴充）
   ========================= */

const nicknameRewards = {
  "吟遊": ["img/img01.png"],
  "🐸🐸🐸": ["img/img4253654878.png"]

};


/* =========================
   🎵 背景音樂
   ========================= */

const bgm = new Audio("img/今晚打老虎.mp3");
bgm.loop = true;
bgm.volume = 0.4; // 0 ~ 1，可自行調整

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    bgm.pause();
  } else {
    bgm.play().catch(() => {});
  }
});

/* =========================
   圖片預載快取
   ========================= */

const imageCache = {};

function preloadImages(callback) {
  const allImages = [
    "img/cover.png",
    ...Object.values(nicknameRewards).flat(),
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
      if (loaded === allImages.length) callback && callback();
    };
    imageCache[src] = img;
  });
}

/* =========================
   🎁 動態卡池
   ========================= */

const cardPool = {
  common: [],
  rare: [],
  super: []
};

for (let i = 1; i <= 28; i++) cardPool.common.push(`img/common${i}.png`);
for (let i = 1; i <= 7; i++) cardPool.rare.push(`img/rare${i}.png`);
for (let i = 1; i <= 2; i++) cardPool.super.push(`img/super${i}.png`);

/* =========================
   Canvas
   ========================= */

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let lastX = null;
let lastY = null;

const BRUSH_SIZE = 60;

/* =========================
   🎆 特效
   ========================= */

let effectLayer = null;

function clearEffect() {
  if (effectLayer) {
    effectLayer.remove();
    effectLayer = null;
  }
}

function showHeartEffect() {
  effectLayer = document.createElement("div");
  effectLayer.className = "effect-layer";

  for (let i = 0; i < 30; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDelay = Math.random() * 2 + "s";
    effectLayer.appendChild(heart);
  }

  document.body.appendChild(effectLayer);
}

function showGoldFirework() {
  effectLayer = document.createElement("div");
  effectLayer.className = "effect-layer";

  for (let i = 0; i < 40; i++) {
    const spark = document.createElement("div");
    spark.className = "gold-spark";
    spark.style.left = Math.random() * 100 + "vw";
    spark.style.top = Math.random() * 100 + "vh";
    effectLayer.appendChild(spark);
  }

  document.body.appendChild(effectLayer);
}

/* =========================
   抽卡邏輯
   ========================= */

let forcedReward = null;
let forcedIndex = 0;

function weightedRandom() {
  const r = Math.random() * 100;
  let type, pool;

  if (r < 70) {
    type = "common";
    pool = cardPool.common;
  } else if (r < 95) {
    type = "rare";
    pool = cardPool.rare;
  } else {
    type = "super";
    pool = cardPool.super;
  }

  return {
    img: pool[Math.floor(Math.random() * pool.length)],
    type
  };
}

function newCard() {
  clearEffect();
  lastX = lastY = null;

  const nickname = document.getElementById("nickname").value.trim();

  let card;

  /* ⭐ 指定暱稱必中 */
  if (nicknameRewards[nickname]) {
    forcedReward = nicknameRewards[nickname];
    const img = forcedReward[forcedIndex % forcedReward.length];
    forcedIndex++;

    card = { img, type: "forced" };
    showHeartEffect();
  } else {
    forcedReward = null;
    forcedIndex = 0;

    card = weightedRandom();
    if (card.type === "rare") showGoldFirework();
    if (card.type === "super") showHeartEffect();
  }

  document.getElementById("prizeImg").src = imageCache[card.img].src;
  setupCanvas();
}

/* =========================
   Canvas 初始化
   ========================= */

function setupCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imageCache["img/cover.png"], 0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = BRUSH_SIZE;
}

/* =========================
   刮刮互動
   ========================= */

function scratch(x, y) {
  if (lastX === null) {
    lastX = x;
    lastY = y;
  }
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
}

/* =========================
   事件
   ========================= */

canvas.addEventListener("mousedown", e => {
  isDrawing = true;
  const r = canvas.getBoundingClientRect();
  lastX = e.clientX - r.left;
  lastY = e.clientY - r.top;
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const r = canvas.getBoundingClientRect();
  scratch(e.clientX - r.left, e.clientY - r.top);
});

canvas.addEventListener("mouseup", resetDraw);
canvas.addEventListener("mouseleave", resetDraw);

canvas.addEventListener("touchstart", e => {
  isDrawing = true;
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  lastX = t.clientX - r.left;
  lastY = t.clientY - r.top;
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!isDrawing) return;
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  scratch(t.clientX - r.left, t.clientY - r.top);
});

canvas.addEventListener("touchend", resetDraw);
canvas.addEventListener("touchcancel", resetDraw);

function resetDraw() {
  isDrawing = false;
  lastX = lastY = null;
}

