// --- Konfiguration (per sida) ---
// Byt dessa värden per övningssida eller sätt upp en init-funktion som läser från JSON inline.
let CORRECT_ANSWER_RAW = "5/6"; // Exempel: kan vara "0.8333333" eller "5/6" eller "0.833"
let ACCEPT_TOLERANCE = 0.01;    // för numeriska svar; sätt 0 om ingen tolerans behövs
let USE_NUMERIC_COMPARISON = false; // sätt true om du vill jämföra numeriskt

// --- Implementationsdetaljer ---
const answerInput = document.getElementById('user-answer');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const feedback = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const resetBtn = document.getElementById('reset-score');

let score = Number(localStorage.getItem('math_score') || 0);
scoreEl.textContent = score;

function normalizeAnswer(str){
  if(!str) return '';
  return str.trim();
}

function parseFractionOrNumber(str){
  // Accepts formats like "5/6", "0.8333", "7"
  str = str.trim();
  if(str.includes('/')){
    const parts = str.split('/');
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if(!isNaN(num) && !isNaN(den) && den !== 0) return num/den;
  }
  const n = Number(str.replace(',', '.'));
  return isNaN(n) ? null : n;
}

function checkAnswer(){
  const userRaw = normalizeAnswer(answerInput.value);
  if(userRaw === ''){
    feedback.textContent = 'Skriv ett svar först.';
    feedback.className = 'text-muted';
    answerInput.focus();
    return;
  }

  if(USE_NUMERIC_COMPARISON){
    const userNum = parseFractionOrNumber(userRaw);
    const correctNum = parseFractionOrNumber(CORRECT_ANSWER_RAW);
    if(userNum === null || correctNum === null){
      feedback.textContent = 'Svar kunde inte tolkas som nummer. Kontrollera formatet.';
      feedback.className = 'feedback-wrong';
      return;
    }
    const diff = Math.abs(userNum - correctNum);
    if(diff <= ACCEPT_TOLERANCE){
      onCorrect();
    } else {
      onWrong();
    }
  } else {
    // flexibel textmatch (ignorerar whitespace och skillnad i decimalsymbol)
    const a = userRaw.replace(/\s+/g,'').replace(',', '.').toLowerCase();
    const b = CORRECT_ANSWER_RAW.toString().replace(/\s+/g,'').replace(',', '.').toLowerCase();
    if(a === b){
      onCorrect();
    } else {
      // Särskild check: försök numeriskt om båda är parsebara
      const userNum = parseFractionOrNumber(userRaw);
      const correctNum = parseFractionOrNumber(CORRECT_ANSWER_RAW);
      if(userNum !== null && correctNum !== null){
        if(Math.abs(userNum - correctNum) <= ACCEPT_TOLERANCE){
          onCorrect();
          return;
        }
      }
      onWrong();
    }
  }
}

function onCorrect(){
  feedback.textContent = 'Rätt! Bra jobbat.';
  feedback.className = 'feedback-correct';
  nextBtn.classList.remove('d-none');
  checkBtn.disabled = true;
  // uppdatera poäng
  score += 1;
  scoreEl.textContent = score;
  localStorage.setItem('math_score', score);
  nextBtn.focus();
}

function onWrong(){
  feedback.textContent = 'Fel — försök igen.';
  feedback.className = 'feedback-wrong';
  answerInput.focus();
}

function resetForNext(){
  feedback.textContent = '';
  feedback.className = '';
  answerInput.value = '';
  checkBtn.disabled = false;
  nextBtn.classList.add('d-none');
  answerInput.focus();
  // NOTE: här kan du byta frågetexten / CORRECT_ANSWER_RAW dynamiskt
}

checkBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', resetForNext);
resetBtn.addEventListener('click', ()=>{
  score = 0;
  scoreEl.textContent = score;
  localStorage.setItem('math_score', score);
});

// Enter-tangent skickar formuläret
document.getElementById('answer-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  checkAnswer();
});
answerInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    e.preventDefault();
    checkAnswer();
  }
});

// Rendera KaTeX (om det behövs på init - auto-render script tar hand om det)
// Om du vill sätta frågetext och rätt svar via JS kan du ex erbjuda en init-funktion:
function initExercise({ questionHTML, correctAnswer, numeric=false, tolerance=0.01 } = {}){
  if(questionHTML) document.getElementById('task-content').innerHTML = questionHTML;
  if(correctAnswer !== undefined) CORRECT_ANSWER_RAW = correctAnswer;
  USE_NUMERIC_COMPARISON = numeric;
  ACCEPT_TOLERANCE = tolerance;
  // efter uppdatering: rendera LaTeX i frågetext
  if(window.renderMathInElement){
    renderMathInElement(document.getElementById('task-content'));
  }
  resetForNext();
}

// Exempel: om du vill initiera via JS för en sida.
// initExercise({ questionHTML: 'Beräkna \\\((\\\frac{1}{2}+\\\frac{1}{3})\\\).', correctAnswer: '5/6', numeric: true, tolerance: 0.0001 });
