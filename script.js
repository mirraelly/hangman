let words = [];
let selectedWord = "";
let selectedHint = "";
let correctLetters = [];
let wrongLetters = [];
let maxTries = 6;
let remainingTries = maxTries;

const wordEl = document.getElementById("word");
const wrongEl = document.getElementById("wrong-letters");
const triesEl = document.getElementById("tries-left");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint-text");
const restartBtn = document.getElementById("restartButton");


function startGame() {
    if (words.length === 0) {
        console.error("Nenhuma palavra foi carregada.");
        return;
    }

    const randomEntry = words[Math.floor(Math.random() * words.length)];
    selectedWord = randomEntry.word.toLowerCase();
    selectedHint = randomEntry.hint;
    hintEl.textContent = selectedHint;

    correctLetters = [];
    wrongLetters = [];
    remainingTries = maxTries;
    messageEl.textContent = "";
    updateDisplay();
}

function updateDisplay() {
    wordEl.innerHTML = selectedWord
        .split("")
        .map(letter => (correctLetters.includes(letter) ? letter : "_"))
        .join(" ");

    wrongEl.textContent = wrongLetters.join(" ");
    triesEl.textContent = remainingTries;

    checkGameStatus();
}

function checkGameStatus() {
    const wordComplete = selectedWord.split("").every(letter => correctLetters.includes(letter));

    if (wordComplete) {
        messageEl.textContent = "🎉 Você venceu!";
    } else if (remainingTries <= 0) {
        messageEl.textContent = `💀 Você perdeu! A palavra era: ${selectedWord}`;
    }
}

function handleKeyPress(e) {
    const letter = e.key.toLowerCase();
    if (!/^[a-z]$/.test(letter) || messageEl.textContent !== "") return;

    if (selectedWord.includes(letter)) {
        if (!correctLetters.includes(letter)) {
            correctLetters.push(letter);
        }
    } else {
        if (!wrongLetters.includes(letter)) {
            wrongLetters.push(letter);
            remainingTries--;
        }
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
