// Typewriter effect for hero section
const phrases = [
  "Master Maths with confidence.",
  "Excel in English and writing.",
  "Succeed in Science subjects.",
  "Ace your upcoming exams.",
];

const typewriterElement = document.querySelector(".typewriter");

let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;

function typeWriter() {
  const currentPhrase = phrases[phraseIndex];
  const currentText = currentPhrase.substring(0, letterIndex);
  typewriterElement.textContent = currentText;

  if (!isDeleting && letterIndex < currentPhrase.length) {
    letterIndex++;
    setTimeout(typeWriter, 80);
  } else if (isDeleting && letterIndex > 0) {
    letterIndex--;
    setTimeout(typeWriter, 40);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) {
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(typeWriter, 1500);
  }
}

// Start after a short delay
setTimeout(typeWriter, 500);