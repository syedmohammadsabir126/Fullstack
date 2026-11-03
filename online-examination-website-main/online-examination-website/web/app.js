const questions = [
  { text: "Which language is used to structure a web page?", options: { A: "HTML", B: "CSS", C: "Java", D: "SQL" }, answer: "A" },
  { text: "Which technology is mainly used to style web pages?", options: { A: "Java", B: "CSS", C: "Python", D: "C" }, answer: "B" },
  { text: "Which language adds interactivity to a web page?", options: { A: "HTML", B: "SQL", C: "JavaScript", D: "CSS" }, answer: "C" },
  { text: "Which HTML element is used to create a hyperlink?", options: { A: "<p>", B: "<img>", C: "<table>", D: "<a>" }, answer: "D" },
  { text: "Which keyword is used to declare a class in Java?", options: { A: "class", B: "define", C: "newclass", D: "struct" }, answer: "A" }
];

const loginPanel = document.getElementById("loginPanel");
const examPanel = document.getElementById("examPanel");
const resultPanel = document.getElementById("resultPanel");
const questionsContainer = document.getElementById("questions");
const timerDisplay = document.getElementById("timer");
const statusMessage = document.getElementById("statusMessage");

let student = { name: "", roll: "" };
let remainingSeconds = 300;
let timerId = null;
let submitted = false;

function renderQuestions() {
  questionsContainer.innerHTML = "";
  questions.forEach((question, index) => {
    const article = document.createElement("article");
    article.className = "question";
    const heading = document.createElement("h3");
    heading.textContent = `${index + 1}. ${question.text}`;
    article.appendChild(heading);

    Object.entries(question.options).forEach(([key, value]) => {
      const label = document.createElement("label");
      label.className = "option";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${index + 1}`;
      radio.value = key;
      const text = document.createElement("span");
      text.textContent = `${key}. ${value}`;
      label.append(radio, text);
      article.appendChild(label);
    });
    questionsContainer.appendChild(article);
  });
}

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  student.name = document.getElementById("studentName").value.trim();
  student.roll = document.getElementById("rollNumber").value.trim();
  if (!student.name || !student.roll) return;

  document.getElementById("studentInfo").textContent =
    `Student: ${student.name} | Roll Number: ${student.roll}`;
  loginPanel.classList.add("hidden");
  examPanel.classList.remove("hidden");
  renderQuestions();
  startTimer();
});

function startTimer() {
  updateTimer();
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    updateTimer();
    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      submitExam(true);
    }
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (remainingSeconds <= 30) timerDisplay.style.color = "#b91c1c";
}

document.getElementById("examForm").addEventListener("submit", (event) => {
  event.preventDefault();
  submitExam(false);
});

async function submitExam(timeUp) {
  if (submitted) return;
  submitted = true;
  clearInterval(timerId);
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = true;
  statusMessage.textContent = "Submitting your answers...";

  const formData = new URLSearchParams();
  formData.set("name", student.name);
  formData.set("roll", student.roll);
  questions.forEach((_, index) => {
    const selected = document.querySelector(`input[name="q${index + 1}"]:checked`);
    formData.set(`q${index + 1}`, selected ? selected.value : "");
  });

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    if (!response.ok) throw new Error("Server returned an error.");
    const result = await response.json();
    showResult(result, timeUp);
  } catch (error) {
    statusMessage.textContent = "Could not contact the Java server. Please restart the server and try again.";
    submitted = false;
    submitButton.disabled = false;
  }
}

function showResult(result, timeUp) {
  examPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  statusMessage.textContent = "";
  document.getElementById("resultStudent").textContent =
    `${result.name} | Roll Number: ${result.roll}`;
  document.getElementById("score").textContent =
    `${result.score} / ${result.total}`;
  document.getElementById("resultMessage").textContent =
    `${timeUp ? "Time is over. " : ""}Correct answers: ${result.score}. Incorrect or unanswered: ${result.total - result.score}.`;
}

document.getElementById("restartButton").addEventListener("click", () => {
  clearInterval(timerId);
  student = { name: "", roll: "" };
  remainingSeconds = 300;
  submitted = false;
  timerDisplay.style.color = "";
  document.getElementById("loginForm").reset();
  document.getElementById("examForm").reset();
  document.getElementById("submitButton").disabled = false;
  resultPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");
});
