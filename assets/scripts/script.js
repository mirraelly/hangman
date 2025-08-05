let words = [];
let wordQueue = [];
let selectedWord = "";
let selectedHint = "";
let correctLetters = [];
let wrongLetters = [];
let maxTries = 6;
let remainingTries = maxTries;
let isGameOver = false;
let normalizedSelectedWord = "";
let soundOn = true;

let hitCount = parseInt(localStorage.getItem('hitCount')) || 0;
let defCount = parseInt(localStorage.getItem('defCount')) || 0;

const wordEl = document.getElementById("word");
const triesEl = document.getElementById("tries-left");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint-text");
const restartBtn = document.getElementById("restartButton");
const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");
const triesContainer = document.querySelector(".text-tentativa");
const hitsEl = document.getElementById("hits-count");
const defeats = document.getElementById("defeats-count");
const soundToggleButton = document.getElementById('soundToggleButton');
const resetScoreButton = document.getElementById("resetScoreButton");
const soundIcon = document.getElementById('soundIcon');
const resultMessageEl = document.getElementById("result-message");

const victorySound = new Howl({
    src: ['./assets/sounds/victory-sound.wav'],
    volume: 0.8
});

const drawSound = new Howl({
    src: ['./assets/sounds/draw.mp3'],
    volume: 0.6
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame() {
    victorySound.stop();
    drawSound.stop();

    if (wordQueue.length === 0) {
        wordQueue = [...words];
        shuffleArray(wordQueue);
    }

    const currentEntry = wordQueue.shift();
    selectedWord = currentEntry.word.toLowerCase();
    selectedHint = currentEntry.hint;

    normalizedSelectedWord = selectedWord
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ç/g, "c");

    correctLetters = [];
    wrongLetters = [];
    remainingTries = maxTries;
    isGameOver = false;
    hitsEl.textContent = hitCount;
    defeats.textContent = defCount;
    hintEl.parentElement.style.display = 'block';
    hintEl.textContent = selectedHint;
    resultMessageEl.style.display = 'none';

    messageEl.textContent = "";
    updateDisplay();
    createKeyboard();
    triesContainer.style.display = "block";
}

function updateDisplay() {
    wordEl.innerHTML = selectedWord
        .split("")
        .map((letter, index) => {
            const normalized = letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");
            return correctLetters.includes(normalized) ? letter : "_";
        })
        .join(" ");

    triesEl.textContent = remainingTries;
    checkGameStatus();
    drawHangman(maxTries - remainingTries);
}

function checkGameStatus() {
    const wordComplete = normalizedSelectedWord
        .split("")
        .every(letter => correctLetters.includes(letter));

    if (wordComplete) {
        if (soundOn) victorySound.play();
        hintEl.parentElement.style.display = 'none';
        resultMessageEl.innerHTML = `Você venceu! <i class="fas fa-smile" aria-hidden="true" style="color: #6b8bc9; font-size: 1.2em;"></i>`;
        resultMessageEl.style.display = 'block';

        isGameOver = true;
        triesContainer.style.display = "none";
        hitCount++;
        hitsEl.textContent = hitCount;
        localStorage.setItem('hitCount', hitCount);
        firework();
    } else if (remainingTries <= 0) {
        if (soundOn) drawSound.play();
        hintEl.parentElement.style.display = 'none';
        resultMessageEl.innerHTML = `Você perdeu! <i class="fas fa-frown" aria-hidden="true" style="color: #e15b73; font-size: 1.2em;"></i>  <br/> A palavra era: ${selectedWord}`;
        resultMessageEl.style.display = 'block';

        isGameOver = true;
        triesContainer.style.display = "none";
        defCount++;
        defeats.textContent = defCount;
        localStorage.setItem('defCount', defCount);
        drawDrawConfetti();
    }
}

function handleKeyPress(e) {
    const rawLetter = e.key.toLowerCase();
    const letter = rawLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");

    if (!/^[a-z]$/.test(letter) || isGameOver) return;

    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        messageEl.textContent = `⚠️ Você já tentou a letra "${rawLetter.toUpperCase()}"`;
        return;
    }

    if (normalizedSelectedWord.includes(letter)) {
        correctLetters.push(letter);
    } else {
        wrongLetters.push(letter);
        remainingTries--;
    }

    updateDisplay();
}

document.addEventListener("keydown", handleKeyPress);
restartBtn.addEventListener("click", startGame);

fetch("./assets/data/words.json")
    .then(response => response.json())
    .then(data => {
        words = data.words;
        wordQueue = [...words];
        shuffleArray(wordQueue);
        startGame();
    })
    .catch(error => {
        console.error("Erro ao carregar palavras:", error);
    });

function createKeyboard() {
    const keyboardContainer = document.getElementById("keyboard");
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    keyboardContainer.innerHTML = "";

    alphabet.split("").forEach(letter => {
        const button = document.createElement("button");
        button.textContent = letter.toUpperCase();
        button.classList.add("key");
        button.disabled = false;

        button.addEventListener("click", () => {
            simulateKeyPress(letter);
        });

        keyboardContainer.appendChild(button);
    });
}

function simulateKeyPress(rawLetter) {
    if (!/^[a-z]$/.test(rawLetter) || isGameOver) return;

    const letter = rawLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");

    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        messageEl.textContent = `⚠️ Você já tentou a letra "${rawLetter.toUpperCase()}"`;
        return;
    }

    if (normalizedSelectedWord.includes(letter)) {
        correctLetters.push(letter);
    } else {
        wrongLetters.push(letter);
        remainingTries--;
    }

    updateDisplay();
    updateKeyboard(letter);
}

function updateKeyboard(letter) {
    const keys = document.querySelectorAll("#keyboard .key");
    keys.forEach(key => {
        if (key.textContent.toLowerCase() === letter) {
            key.disabled = true;
            key.classList.add("used");

            if (!selectedWord.includes(letter)) {
                key.classList.add("wrong");
            }
        }
    });
}

function drawHangman(stage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2d3748";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Estrutura da forca
    ctx.beginPath();
    ctx.moveTo(10, 240); ctx.lineTo(190, 240); // base
    ctx.moveTo(50, 240); ctx.lineTo(50, 20);   // poste vertical
    ctx.lineTo(130, 20);                       // topo horizontal
    ctx.lineTo(130, 40);                       // corda
    ctx.stroke();

    if (stage > 0) {
        // Cabeça
        ctx.beginPath();
        ctx.arc(130, 60, 20, 0, Math.PI * 2); // x, y, raio
        ctx.fillStyle = "#edf2f7";
        ctx.fill();
        ctx.stroke();
    }
    if (stage > 1) {
        // Corpo
        ctx.beginPath();
        ctx.moveTo(130, 80); ctx.lineTo(130, 140);
        ctx.stroke();
    }
    if (stage > 2) {
        // Braço esquerdo
        ctx.beginPath();
        ctx.moveTo(130, 100); ctx.lineTo(100, 120);
        ctx.stroke();
    }
    if (stage > 3) {
        // Braço direito
        ctx.beginPath();
        ctx.moveTo(130, 100); ctx.lineTo(160, 120);
        ctx.stroke();
    }
    if (stage > 4) {
        // Perna esquerda
        ctx.beginPath();
        ctx.moveTo(130, 140); ctx.lineTo(110, 180);
        ctx.stroke();
    }
    if (stage > 5) {
        // Perna direita
        ctx.beginPath();
        ctx.moveTo(130, 140); ctx.lineTo(150, 180);
        ctx.stroke();
    }
}


soundToggleButton.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) {
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
    } else {
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
        victorySound.stop();
        drawSound.stop();
    }
});

resetScoreButton.addEventListener('click', () => {
    hitCount = 0;
    defCount = 0;
    localStorage.setItem('hitCount', 0);
    localStorage.setItem('defCount', 0);
    startGame();
});

function firework() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: Math.random(), y: Math.random() * 0.5 }
        }));
    }, 250);
}

function drawDrawConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 10, spread: 60, ticks: 120, zIndex: 1000, colors: ['#a0aec0', '#cbd5e1', '#f1f5f9'] };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        confetti(Object.assign({}, defaults, {
            particleCount: 5,
            origin: { x: Math.random(), y: 0 }
        }));
    }, 200);
}