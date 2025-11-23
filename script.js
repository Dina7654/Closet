const cityName = document.getElementById("cityName");
const currentWeather = document.getElementById("currentWeather");
const hourlyRow = document.getElementById("hourlyRow");

async function loadWeather() {
  const lat = 43.65107;
  const lon = -79.347015;

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&hourly=temperature_2m,weathercode` +
    `&timezone=America%2FToronto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const cw = data.current_weather;

    currentWeather.textContent =
      `${Math.round(cw.temperature)}°C — ${codeToText(cw.weathercode)}`;

    updateHourlyWeather(data);

  } catch (e) {
    currentWeather.textContent = "Weather unavailable";
  }
}

function codeToText(code) {
  const table = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    61: "Rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    95: "Thunderstorm"
  };
  return table[code] || "Weather";
}

function codeToIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if ([61,63,65].includes(code)) return "🌧️";
  if ([71].includes(code)) return "❄️";
  if (code === 95) return "⛈️";
  return "☁️";
}

function updateHourlyWeather(data) {
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  const now = new Date();
  let start = 0;

  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]);
    if (t.getHours() === now.getHours()) {
      start = i;
      break;
    }
  }

  hourlyRow.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const idx = start + i;

    const hour = new Date(times[idx]).getHours();
    const hourStr = hour > 12 ? `${hour-12}pm` : `${hour}am`;

    const box = document.createElement("div");
    box.className = "hour-box";
    box.innerHTML = `
      <div>${hourStr}</div>
      <div style="font-size:1.2rem">${codeToIcon(codes[idx])}</div>

      <div>${Math.round(temps[idx])}°</div>
    `;

    hourlyRow.appendChild(box);
  }
}

loadWeather();


const generateBtn = document.getElementById("generateBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const outfitBox = document.getElementById("outfitResult");
const outfitText = document.getElementById("outfitText");
const occasionSelect = document.getElementById("occasion");

generateBtn.onclick = generateOutfit;
tryAgainBtn.onclick = generateOutfit;

function generateOutfit() {
  const closet = loadCloset();

  const tops = closet.filter(i => i.category === "top");
  const bottoms = closet.filter(i => i.category === "bottom");
  const shoes = closet.filter(i => i.category === "shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    outfitText.textContent = "Add at least one top, bottom, and shoes.";
    outfitBox.classList.remove("hidden");
    return;
  }

  const top = pick(tops);
  const bottom = pick(bottoms);
  const shoe = pick(shoes);

  const occasion = occasionSelect.value;

  outfitText.textContent =
    `${occasion.toUpperCase()}: ${top.color} top, ${bottom.color} bottom, ${shoe.color} shoes.`;

  outfitBox.classList.remove("hidden");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const calendarGrid = document.getElementById("calendarGrid");
const todayText = document.getElementById("todayText");

function buildCalendar() {
  const now = new Date();
  const date = now.getDate();
  const month = now.toLocaleString("default", { month: "long" });
  const weekday = now.toLocaleString("default", { weekday: "long" });

  todayText.textContent = `Today is ${weekday}, ${month} ${date}`;

  calendarGrid.innerHTML = "";

  for (let i = 1; i <= 30; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = i;

    if (i === date) cell.classList.add("today");

    calendarGrid.appendChild(cell);
  }
}

buildCalendar();

const openClosetBtn = document.getElementById("openClosetBtn");
const closeClosetBtn = document.getElementById("closeCloset");
const closetPanel = document.getElementById("closetPanel");

openClosetBtn.onclick = () => closetPanel.classList.add("open");
closeClosetBtn.onclick = () => closetPanel.classList.remove("open");

const catInput = document.getElementById("catInput");
const colorInput = document.getElementById("colorInput");
const urlInput = document.getElementById("urlInput");
const fileInput = document.getElementById("fileInput");
const addItemBtn = document.getElementById("addItemBtn");
const closetGrid = document.getElementById("closetGrid");

addItemBtn.onclick = async () => {
  let imageURL = urlInput.value.trim();
  const file = fileInput.files[0];

  if (file) {
    imageURL = await fileToDataURL(file);
  }

  if (!imageURL) {
    alert("Add an image URL or file.");
    return;
  }

  const item = {
    id: Date.now(),
    category: catInput.value,
    color: colorInput.value || "item",
    image: imageURL
  };

  const closet = loadCloset();
  closet.push(item);
  saveCloset(closet);

  colorInput.value = "";
  urlInput.value = "";
  fileInput.value = "";

  renderCloset();
};

function loadCloset() {
  return JSON.parse(localStorage.getItem("closet") || "[]");
}

function saveCloset(data) {
  localStorage.setItem("closet", JSON.stringify(data));
}

function renderCloset() {
  const closet = loadCloset();
  closetGrid.innerHTML = "";

  closet.forEach(item => {
    const box = document.createElement("div");
    box.className = "closet-item";
    box.innerHTML = `
      <img src="${item.image}">
      <p>${item.color} ${item.category}</p>
      <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
    `;
    closetGrid.appendChild(box);
  });
}

function deleteItem(id) {
  const closet = loadCloset().filter(i => i.id !== id);
  saveCloset(closet);
  renderCloset();
}

function fileToDataURL(file) {
  return new Promise(res => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.readAsDataURL(file);
  });
}

renderCloset();
