
"use strict";

// ============================================
// BACHPANBEATS - MUSIC PLAYER
// ============================================

// DOM ELEMENTS
const audio = document.getElementById("audio");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const album = document.getElementById("album");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const categoryStatus = document.getElementById("categoryStatus");

// ============================================
// MUSIC FOLDERS
// ============================================

const musicFolders = [
  {
    category: "90s Classics",
    folder: "music/90 hindi romantic",
    count: 10
  },
  {
    category: "Bhojpuri Classics",
    folder: "music/Bhojpuri song",
    count: 10
  },
  {
    category: "Sad Songs",
    folder: "music/90 sad",
    count: 10
  }
];

// Generate numbered song paths automatically.
const songs = musicFolders.flatMap((group) =>
  Array.from({ length: group.count }, (_, index) => {
    const number = index + 1;

    return {
      title: `${group.category} - Song ${number}`,
      artist: group.category,
      category: group.category,
      src: `${group.folder}/song${number}.mp3`
    };
  })
);

let currentList = [...songs];
let currentIndex = 0;

// ============================================
// HELPERS
// ============================================

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function updatePlayButton(playing) {
  playBtn.textContent = playing ? "Ⅱ" : "▶";

  playBtn.setAttribute(
    "aria-label",
    playing ? "Pause" : "Play"
  );
}

function setStatus(message) {
  if (categoryStatus) {
    categoryStatus.textContent = message;
  }
}

// ============================================
// LOAD SONG
// ============================================

function loadSong(index) {
  if (!currentList.length) {
    setStatus("Is category mein koi song available nahi hai.");
    return false;
  }

  currentIndex =
    (index + currentList.length) % currentList.length;

  const song = currentList[currentIndex];

  audio.pause();

  audio.src = song.src;
  audio.load();

  trackTitle.textContent = song.title;
  trackArtist.textContent = song.artist;
  album.textContent = "♫";

  seekBar.value = 0;

  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  updatePlayButton(false);

  return true;
}

// ============================================
// PLAY / PAUSE
// ============================================

async function playSong() {
  if (!currentList.length) return;

  if (!audio.getAttribute("src")) {
    if (!loadSong(currentIndex)) return;
  }

  try {
    await audio.play();

    updatePlayButton(true);

    setStatus(
      `Now playing: ${currentList[currentIndex].title}`
    );

  } catch (error) {
    updatePlayButton(false);

    setStatus(
      "Song nahi chala. MP3 filename aur folder path check karein."
    );

    console.error("Audio playback error:", error);
  }
}

function pauseSong() {
  audio.pause();
  updatePlayButton(false);
}

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

// ============================================
// PREVIOUS / NEXT
// ============================================

prevBtn.addEventListener("click", async () => {
  if (loadSong(currentIndex - 1)) {
    await playSong();
  }
});

nextBtn.addEventListener("click", async () => {
  if (loadSong(currentIndex + 1)) {
    await playSong();
  }
});

// ============================================
// PROGRESS BAR AND TIME
// ============================================

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(audio.currentTime);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    seekBar.value =
      (audio.currentTime / audio.duration) * 100;
  }
});

seekBar.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime =
      (Number(seekBar.value) / 100) * audio.duration;
  }
});

// ============================================
// AUTOMATIC NEXT SONG
// ============================================

audio.addEventListener("ended", () => {
  if (loadSong(currentIndex + 1)) {
    playSong();
  }
});

// ============================================
// AUDIO EVENTS
// ============================================

audio.addEventListener("play", () => {
  updatePlayButton(true);
});

audio.addEventListener("pause", () => {
  updatePlayButton(false);
});

// Show buffering message.
audio.addEventListener("waiting", () => {
  if (!audio.paused) {
    setStatus("Song loading... please wait.");
  }
});

// Show playback-ready message.
audio.addEventListener("canplay", () => {
  if (!audio.paused) {
    setStatus(
      `Now playing: ${currentList[currentIndex].title}`
    );
  }
});

// Handle missing or unsupported audio files.
audio.addEventListener("error", () => {
  if (!audio.getAttribute("src")) return;

  updatePlayButton(false);

  setStatus(
    "Audio file load nahi hua. MP3 filename aur folder path check karein."
  );

  console.error("Failed audio path:", audio.currentSrc);
});

// ============================================
// CATEGORY BUTTONS
// ============================================

const categoryButtons =
  document.querySelectorAll(".category-card");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    currentList = songs.filter(
      (song) => song.category === category
    );

    currentIndex = 0;

    // Highlight selected category.
    categoryButtons.forEach((card) => {
      card.classList.toggle("active", card === button);
    });

    // Handle empty categories.
    if (!currentList.length) {
      audio.pause();

      audio.removeAttribute("src");
      audio.load();

      trackTitle.textContent = category;
      trackArtist.textContent = "No songs available";

      seekBar.value = 0;
      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";

      updatePlayButton(false);

      setStatus(
        "Is category ke liye MP3 files add karein."
      );

      return;
    }

    // Load first song of selected category.
    loadSong(0);

    setStatus(
      `${category} selected. Play button dabakar gaana sunen.`
    );
  });
});

// ============================================
// RAIN VISUAL TOGGLE
// ============================================

const rainToggle = document.getElementById("rainToggle");
const rainLayer = document.getElementById("rainLayer");
const rainState = document.getElementById("rainState");
const hero = document.querySelector(".hero");

rainToggle.addEventListener("click", () => {
  const enabled =
    rainToggle.getAttribute("aria-pressed") !== "true";

  rainToggle.setAttribute(
    "aria-pressed",
    String(enabled)
  );

  rainState.textContent = enabled ? "ON" : "OFF";

  // Match the CSS selector: .hero.raining .rain-layer
  hero.classList.toggle("raining", enabled);

  if (rainLayer) {
    rainLayer.classList.toggle("rain-active", enabled);
  }
});

// ============================================
// ABOUT / FAQ DIALOGS
// ============================================

const infoDialog = document.getElementById("infoDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

const aboutBtn = document.getElementById("aboutBtn");
const faqBtn = document.getElementById("faqBtn");
const closeDialog = document.getElementById("closeDialog");

aboutBtn.addEventListener("click", () => {
  dialogTitle.textContent = "About BachpanBeats";

  dialogText.textContent =
    "BachpanBeats celebrates purane gaane, bachpan ki yaadein aur desi music.";

  infoDialog.showModal();
});

faqBtn.addEventListener("click", () => {
  dialogTitle.textContent = "Frequently Asked Questions";

  dialogText.textContent =
    "Category select karein aur Play dabayein. Song nahi bajta hai toh MP3 filename aur path check karein.";

  infoDialog.showModal();
});

closeDialog.addEventListener("click", () => {
  infoDialog.close();
});

infoDialog.addEventListener("click", (event) => {
  if (event.target === infoDialog) {
    infoDialog.close();
  }
});

// ============================================
// INITIALIZE WEBSITE
// ============================================

loadSong(0);

updatePlayButton(false);
