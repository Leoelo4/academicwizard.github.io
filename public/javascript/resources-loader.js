// Load and display resources from database
document.addEventListener('DOMContentLoaded', async () => {
  await loadResources();
});

async function loadResources() {
  try {
    const response = await fetch('http://localhost:5000/api/resources');
    
    if (!response.ok) {
      console.error('Failed to fetch resources');
      showNoResources();
      return;
    }

    const data = await response.json();
    const resources = data.data || [];

    if (resources.length === 0) {
      showNoResources();
      return;
    }

    // Group resources by level
    const groupedResources = {
      'KS3': [],
      'GCSE': [],
      'A-Level': [],
      'All': []
    };

    resources.forEach(resource => {
      if (groupedResources[resource.level]) {
        groupedResources[resource.level].push(resource);
      }
    });

    // Display resources for each level
    let hasAnyResources = false;

    if (groupedResources['KS3'].length > 0) {
      displayResourcesForLevel('ks3', groupedResources['KS3']);
      document.getElementById('ks3-section').style.display = 'block';
      hasAnyResources = true;
    }

    if (groupedResources['GCSE'].length > 0) {
      displayResourcesForLevel('gcse', groupedResources['GCSE']);
      document.getElementById('gcse-section').style.display = 'block';
      hasAnyResources = true;
    }

    if (groupedResources['A-Level'].length > 0) {
      displayResourcesForLevel('alevel', groupedResources['A-Level']);
      document.getElementById('alevel-section').style.display = 'block';
      hasAnyResources = true;
    }

    if (groupedResources['All'].length > 0) {
      displayResourcesForLevel('all', groupedResources['All']);
      document.getElementById('all-section').style.display = 'block';
      hasAnyResources = true;
    }

    if (!hasAnyResources) {
      showNoResources();
    }

  } catch (error) {
    console.error('Error loading resources:', error);
    showNoResources();
  }
}

function displayResourcesForLevel(levelId, resources) {
  const container = document.getElementById(`${levelId}-resources`);
  
  resources.forEach(resource => {
    const resourceCard = createResourceCard(resource);
    container.appendChild(resourceCard);
  });
}

function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'resource-card';

  // Get emoji based on subject
  const emoji = getSubjectEmoji(resource.subject);

  card.innerHTML = `
    <h3>${emoji} ${resource.title}</h3>
    <p>${resource.description}</p>
    <a href="${resource.fileUrl}" target="_blank" class="btn btn-secondary">Download ${resource.fileType ? resource.fileType.toUpperCase() : 'PDF'}</a>
  `;

  return card;
}

function getSubjectEmoji(subject) {
  const emojiMap = {
    'Maths': '📐',
    'Mathematics': '📐',
    'Science': '🔬',
    'Physics': '⚗️',
    'Chemistry': '⚗️',
    'Biology': '🧬',
    'English': '✍️',
    'History': '📜',
    'Geography': '🌍',
    'Computing': '💻',
    'Art': '🎨',
    'Music': '🎵',
    'Languages': '🗣️',
    'PE': '⚽',
    'Study Skills': '📝'
  };

  return emojiMap[subject] || '📚';
}

function showNoResources() {
  document.getElementById('no-resources').style.display = 'block';
}
