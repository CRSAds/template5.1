// Test environment setup for SwipePages flow

// Mock flow sections
const createTestSections = () => {
  // Create test sections
  const sections = [
    { id: 'step-1', type: 'flow-section' },
    { id: 'step-2', type: 'flow-section' },
    { id: 'step-3', type: 'flow-section' },
    { id: 'coreg-1', type: 'coreg-section' }
  ];

  // Add sections to DOM
  sections.forEach(section => {
    const div = document.createElement('div');
    div.className = section.type;
    div.id = section.id;
    div.innerHTML = `
      <h2>Step ${section.id.split('-')[1]}</h2>
      <button class="flow-next">Next</button>
    `;
    document.body.appendChild(div);
  });

  // Add long form section
  const longFormSection = document.createElement('div');
  longFormSection.id = 'long-form-section';
  longFormSection.className = 'flow-section';
  longFormSection.innerHTML = `
    <h2>Long Form</h2>
    <input type="text" id="postcode" placeholder="Postcode">
    <input type="text" id="straat" placeholder="Straat">
    <input type="text" id="huisnummer" placeholder="Huisnummer">
    <input type="text" id="woonplaats" placeholder="Woonplaats">
    <input type="text" id="telefoon" placeholder="Telefoon">
    <button class="flow-next">Submit</button>
  `;
  document.body.appendChild(longFormSection);
};

// Mock form validation
const mockFormValidation = () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simulate validation
      const isValid = true; // Always valid for testing
      if (isValid) {
        const nextButton = form.closest('.flow-section')?.querySelector('.flow-next');
        if (nextButton) nextButton.click();
      }
    });
  });
};

// Load monitoring scripts
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Setup test environment
const setupTestEnvironment = () => {
  // Mock SwipePages environment
  window.location.hostname = 'test.swipepages.com';
  
  // Create test sections
  createTestSections();
  
  // Mock form validation
  mockFormValidation();
  
  // Load monitoring scripts first
  Promise.all([
    loadScript('../monitoring/vercel-analytics.js'),
    loadScript('../initFlow.js')
  ]).then(() => {
    console.log('Test environment initialized');
    // Initialize flow
    initFlow();
  }).catch(error => {
    console.error('Error loading scripts:', error);
  });
};
