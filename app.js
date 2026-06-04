// ============================================
// PHASE 3: app.js — the brain of DevCard
// ============================================

// This array holds all the skills the user adds
// Arrays are like a list — [] means it starts empty
let skills = [];

// This will hold the GitHub data we get from the API
// null means "nothing yet"
let ghData = null;


// ============================================
// SKILL TAG LOGIC
// ============================================

// This runs when the user presses Enter in the skill input
// addEventListener "listens" for a specific action on an element
document.getElementById('skill-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addSkill();
  }
});


// Called when user clicks "+ Add" or presses Enter
function addSkill() {
  // .value gives us what's typed in the input
  // .trim() removes accidental spaces at start/end
  const val = document.getElementById('skill-input').value.trim();

  // Don't add if empty or already in the list
  if (!val || skills.includes(val)) {
    document.getElementById('skill-input').value = '';
    return; // stop the function here
  }

  // .push() adds the new skill to the end of the array
  skills.push(val);

  // Clear the input box after adding
  document.getElementById('skill-input').value = '';

  // Re-draw the pills on screen
  renderSkills();
}


// Removes a skill by its index (position) in the array
function removeSkill(index) {
  // .splice(index, 1) removes 1 item at that position
  skills.splice(index, 1);
  renderSkills();
}


// Builds the skill pills HTML and injects into the page
function renderSkills() {
  const container = document.getElementById('skills-list');

  // .map() loops over the array and returns a new array
  // here we turn each skill string into an HTML string
  const pillsHTML = skills.map(function(skill, index) {
    return `
      <span class="skill-pill">
        ${skill}
        <button onclick="removeSkill(${index})">×</button>
      </span>
    `;
  });

  // .join('') combines the array of strings into one big string
  // then we set it as the inner HTML of the container
  container.innerHTML = pillsHTML.join('');
}


// ============================================
// GENERATE CARD — the main function
// ============================================

// async means this function can "wait" for things
// (like waiting for GitHub to respond)
async function generateCard() {
  // Read values from all input fields
  const name   = document.getElementById('inp-name').value.trim();
  const role   = document.getElementById('inp-role').value.trim();
  const github = document.getElementById('inp-github').value.trim();
  const bio    = document.getElementById('inp-bio').value.trim();

  // Validation — don't proceed without a name
  if (!name) {
    setStatus('Please enter your name.');
    return;
  }

  // Disable button so user can't click twice
  const btn = document.querySelector('.generate-btn');
  btn.disabled = true;
  setStatus('Fetching GitHub stats...');

  // Reset GitHub data before each search
  ghData = null;

  // Only call GitHub API if username was entered
  if (github) {
    try {
      // fetch() makes a network request to the URL
      // await means: wait here until we get a response
      const response = await fetch(`https://api.github.com/users/${github}`);

      if (response.ok) {
        // .json() converts the response into a JS object
        ghData = await response.json();
        setStatus('');
      } else {
        setStatus('GitHub user not found — showing card without stats.');
      }

    } catch (error) {
      // catch runs if something goes wrong (no internet, etc.)
      setStatus('Could not reach GitHub — showing card without stats.');
    }
  } else {
    setStatus('');
  }

  // Now render the card with all the data we have
  renderCard(name, role, bio, github);

  // Re-enable the button
  btn.disabled = false;
}


// ============================================
// RENDER THE CARD
// ============================================

function renderCard(name, role, bio, github) {

  // Make initials from the name (e.g. "Priya Sharma" → "PS")
  const initials = name
    .split(' ')               // split into ["Priya", "Sharma"]
    .map(word => word[0])     // take first letter of each → ["P", "S"]
    .join('')                 // join → "PS"
    .toUpperCase()
    .slice(0, 2);             // max 2 characters

  // If GitHub returned an avatar, show the image
  // Otherwise show the initials
  const avatarHTML = ghData && ghData.avatar_url
    ? `<img src="${ghData.avatar_url}" alt="${name}">`
    : initials;

  // Use GitHub stats if available, otherwise show dashes
  const repos     = ghData ? ghData.public_repos : '—';
  const followers = ghData ? ghData.followers    : '—';
  const following = ghData ? ghData.following    : '—';

  // Build skill tags HTML (or a message if none added)
  const skillsHTML = skills.length > 0
    ? skills.map(s => `<span class="card-skill">${s}</span>`).join('')
    : '<span style="font-size:12px;color:#aaa;">No skills added yet</span>';

  // Only show bio section if user typed something
  const bioHTML = bio
    ? `<p class="card-bio">${bio}</p>`
    : '';

  // Use typed role, or GitHub bio as fallback, or default text
  const displayRole = role
    || (ghData && ghData.bio ? ghData.bio.slice(0, 60) : 'Developer');

  // GitHub link at the bottom of the card
  const githubLink = github
    ? `<a href="https://github.com/${github}" target="_blank">github.com/${github}</a>`
    : '';

  // Build the full card HTML using a template literal
  // Template literals use backticks ` ` and ${} for variables
  const cardHTML = `
    <div class="card-header">
      <div class="avatar">${avatarHTML}</div>
      <div>
        <p class="card-name">${name}</p>
        <p class="card-role">${displayRole}</p>
      </div>
    </div>

    ${bioHTML}

    <div class="card-skills">${skillsHTML}</div>

    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-num">${repos}</div>
        <div class="stat-label">Repos</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${followers}</div>
        <div class="stat-label">Followers</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">${following}</div>
        <div class="stat-label">Following</div>
      </div>
    </div>

    <div class="card-footer">
      ${githubLink}
      <span>Made with DevCard</span>
    </div>
  `;

  // Finally — inject the card into the page
  document.getElementById('devcard').innerHTML = cardHTML;
  // Show the download button now that card is ready
  document.getElementById('download-btn').style.display = 'block';
}


// ============================================
// HELPER FUNCTION
// ============================================

// Updates the small status message below the button
function setStatus(message) {
  document.getElementById('status-msg').textContent = message;
}
// ============================================
// THEME TOGGLE
// ============================================

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-btn');

  // toggle() adds the class if missing, removes if present
  body.classList.toggle('light');

  // Check which mode we're now in and update button text
  if (body.classList.contains('light')) {
    btn.innerHTML = '<span class="toggle-icon">☀️</span> Light';
  } else {
    btn.innerHTML = '<span class="toggle-icon">🌙</span> Dark';
  }

  // Save the preference so it remembers on next visit
  localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
}

// When page loads, check if user had a saved preference
window.addEventListener('load', function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    document.getElementById('theme-btn').innerHTML = '<span class="toggle-icon">☀️</span> Light';
  }
});
// ============================================
// DOWNLOAD CARD AS IMAGE
// ============================================

function downloadCard() {
  const card = document.getElementById('devcard');

  // html2canvas takes a "screenshot" of the element
  // it returns a Promise — so we use .then() to wait for it
  html2canvas(card, {
    scale: 2,           // 2x quality — sharper image
    useCORS: true       // allows loading the GitHub avatar image
  }).then(function(canvas) {

    // canvas is like a drawing board — we convert it to an image URL
    const imageURL = canvas.toDataURL('image/png');

    // Create a fake <a> link, click it, then remove it
    // this triggers a file download in the browser
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'my-devcard.png';
    link.click();
    link.remove();
  });
}