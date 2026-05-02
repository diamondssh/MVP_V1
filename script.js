const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const timeDisplay = document.getElementById("timeDisplay");
const timerFace = document.getElementById("timerFace");
const status = document.getElementById("status");
const message = document.getElementById("message");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

let totalSeconds = 0;
let initialSeconds = 0;
let timerId = null;
let isPaused = false;

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("timer-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("timer-theme", theme);

  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☾" : "☀";
  themeText.textContent = isDark ? "블랙" : "화이트";
  themeToggle.setAttribute("aria-label", isDark ? "화이트 모드로 변경" : "블랙 모드로 변경");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
}

function updateDisplay(seconds) {
  timeDisplay.textContent = formatTime(seconds);

  const elapsed = initialSeconds > 0 ? initialSeconds - seconds : 0;
  const progress = initialSeconds > 0 ? Math.min(100, (elapsed / initialSeconds) * 100) : 0;

  timerFace.style.setProperty("--progress", `${progress}%`);
}

function setInputsDisabled(disabled) {
  minutesInput.disabled = disabled;
  secondsInput.disabled = disabled;
}

function setMessage(text, type = "error") {
  message.textContent = text;
  message.classList.toggle("success", type === "success");
}

function setState(state) {
  status.className = "status-pill";

  startBtn.disabled = state !== "initial";
  pauseBtn.disabled = state !== "running";
  resumeBtn.disabled = state !== "paused";

  if (state === "running") {
    status.textContent = "진행";
    status.classList.add("running");
  } else if (state === "paused") {
    status.textContent = "정지";
    status.classList.add("paused");
  } else if (state === "done") {
    status.textContent = "완료";
    status.classList.add("done");
  } else {
    status.textContent = "대기";
  }
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function finishTimer() {
  stopTimer();
  totalSeconds = 0;
  isPaused = false;

  updateDisplay(0);
  setInputsDisabled(false);
  setState("done");
  setMessage("시간이 종료되었습니다.", "success");
}

function runTimer() {
  stopTimer();

  timerId = setInterval(() => {
    totalSeconds -= 1;
    updateDisplay(totalSeconds);

    if (totalSeconds <= 0) {
      finishTimer();
    }
  }, 1000);
}

function readDuration() {
  const minutes = Number(minutesInput.value) || 0;
  const seconds = Number(secondsInput.value) || 0;

  if (minutes < 0 || seconds < 0) {
    return { error: "0 이상의 숫자를 입력해 주세요." };
  }

  if (seconds > 59) {
    return { error: "초는 0부터 59 사이로 입력해 주세요." };
  }

  const duration = minutes * 60 + seconds;

  if (duration <= 0) {
    return { error: "1초 이상 입력해 주세요." };
  }

  return { duration };
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

startBtn.addEventListener("click", () => {
  const result = readDuration();

  if (result.error) {
    setMessage(result.error);
    return;
  }

  initialSeconds = result.duration;
  totalSeconds = result.duration;
  isPaused = false;

  setMessage("");
  updateDisplay(totalSeconds);
  setInputsDisabled(true);
  setState("running");
  runTimer();
});

pauseBtn.addEventListener("click", () => {
  if (timerId === null) {
    return;
  }

  stopTimer();
  isPaused = true;
  setState("paused");
  setMessage("타이머가 일시정지되었습니다.");
});

resumeBtn.addEventListener("click", () => {
  if (!isPaused || totalSeconds <= 0) {
    return;
  }

  isPaused = false;
  setMessage("");
  setState("running");
  runTimer();
});

resetBtn.addEventListener("click", () => {
  stopTimer();

  totalSeconds = 0;
  initialSeconds = 0;
  isPaused = false;

  minutesInput.value = "";
  secondsInput.value = "";

  updateDisplay(0);
  setMessage("");
  setInputsDisabled(false);
  setState("initial");
});

[minutesInput, secondsInput].forEach((input) => {
  input.addEventListener("input", () => {
    setMessage("");
  });
});

applyTheme(getPreferredTheme());
setState("initial");
updateDisplay(0);
