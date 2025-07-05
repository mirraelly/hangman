let words = [];
let selectedWord = "";
let selectedHint = "";
let correctLetters = [];
let wrongLetters = [];
let maxTries = 6;
let remainingTries = maxTries;
let isGameOver = false;
let hitCount = 0;
let defCount = 0;

const wordEl = document.getElementById("word");
const triesEl = document.getElementById("tries-left");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint-text");
const restartBtn = document.getElementById("restartButton");
const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");
const triesContainer = document.getElementById("tries-container");
const hitsEl = document.getElementById("hits-count");
const defeats = document.getElementById("defeats-count");

function startGame() {
    if (words.length === 0) {
        console.error("Nenhuma palavra foi carregada.");
        return;
    }

    const randomEntry = words[Math.floor(Math.random() * words.length)];
    selectedWord = randomEntry.word.toLowerCase();
    selectedHint = randomEntry.hint;
    correctLetters = [];
    wrongLetters = [];
    remainingTries = maxTries;
    isGameOver = false;

    hintEl.textContent = selectedHint;
    messageEl.textContent = "";
    updateDisplay();
    createKeyboard();
    triesContainer.style.display = "block";
}

function updateDisplay() {
    wordEl.innerHTML = selectedWord
        .split("")
        .map(letter => (correctLetters.includes(letter) ? letter : "_"))
        .join(" ");

    triesEl.textContent = remainingTries;

    checkGameStatus();
    drawHangman(maxTries - remainingTries);
}

function checkGameStatus() {
    const wordComplete = selectedWord
        .split("")
        .every(letter => correctLetters.includes(letter));

    if (wordComplete) {
        messageEl.textContent = "🎉 Você venceu!";
        isGameOver = true;
        triesContainer.style.display = "none";
        hitCount++;
        hitsEl.textContent = hitCount;
    } else if (remainingTries <= 0) {
        messageEl.textContent = `💀 Você perdeu! A palavra era: ${selectedWord}`;
        isGameOver = true;
        triesContainer.style.display = "none";
        defCount++;
        defeats.textContent = defCount;
    }
}


function handleKeyPress(e) {
    const letter = e.key.toLowerCase();

    if (!/^[a-z]$/.test(letter) || isGameOver) return;

    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        messageEl.textContent = `⚠️ Você já tentou a letra "${letter.toUpperCase()}"`;
        return;
    }

    if (selectedWord.includes(letter)) {
        correctLetters.push(letter);
    } else {
        wrongLetters.push(letter);
        remainingTries--;
    }

    updateDisplay();
}

document.addEventListener("keydown", handleKeyPress);
restartBtn.addEventListener("click", startGame);

fetch("words.json")
    .then(response => response.json())
    .then(data => {
        words = data.words;
        startGame();
    })
    .catch(error => {
        console.error("Erro ao carregar palavras:", error);
    });

function createKeyboard() {
    const keyboardContainer = document.getElementById("keyboard");
    const alphabet = "abcdefghijklmnopqrstuvwxyzç";

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

function simulateKeyPress(letter) {
    if (!/^[a-z]$/.test(letter) || isGameOver) return;

    if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
        messageEl.textContent = `⚠️ Você já tentou a letra "${letter.toUpperCase()}"`;
        return;
    }

    if (selectedWord.includes(letter)) {
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