// --- Load job data and manage swipe logic ---
let jobs = [];
let currentIndex = 0;

const jobContainer = document.getElementById("job-card-container");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const infoBtn = document.getElementById("info-btn");

// Modal elements
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalCompany = document.getElementById("modal-company");
const modalType = document.getElementById("modal-type");
const modalLocation = document.getElementById("modal-location");
const modalSalary = document.getElementById("modal-salary");
const modalDescription = document.getElementById("modal-description");
const modalTags = document.getElementById("modal-tags");

// Load JSON data
fetch("data/jobs.json")
  .then(res => res.json())
  .then(data => {
    jobs = data;
    showJob();
  });

// Display a job card
function showJob() {
  if (currentIndex >= jobs.length) {
    jobContainer.innerHTML = "<p>🎉 Plus d'offres disponibles !</p>";
    return;
  }

  const job = jobs[currentIndex];
  jobContainer.innerHTML = `
    <div class="job-card">
      <img src="${job.image}" alt="${job.title}">
      <h2>${job.title}</h2>
      <p><strong>${job.company}</strong></p>
      <p>${job.location}</p>
      <p><em>${job.type}</em></p>
      <p>💰 ${job.salary}</p>
      <div class="tags">${job.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  `;
}

// Handle buttons
yesBtn.addEventListener("click", () => {
  alert(`✅ Candidature envoyée pour : ${jobs[currentIndex].title}`);
  currentIndex++;
  showJob();
});

noBtn.addEventListener("click", () => {
  currentIndex++;
  showJob();
});

infoBtn.addEventListener("click", () => {
  const job = jobs[currentIndex];
  modalTitle.textContent = job.title;
  modalCompany.textContent = "Entreprise : " + job.company;
  modalType.textContent = "Type : " + job.type;
  modalLocation.textContent = "Lieu : " + job.location;
  modalSalary.textContent = "Salaire : " + job.salary;
  modalDescription.textContent = job.description;
  modalTags.innerHTML = job.tags.map(t => `<span class="tag">${t}</span>`).join('');
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});
    