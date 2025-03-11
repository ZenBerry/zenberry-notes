// Function to extract domain from current URL
function getDomain() {
    return window.location.hostname;
  }
  
  // Initialize storage
  const currentDomain = getDomain();
  
  // Load domain-specific note and position from storage
  function loadNoteData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ 
        [`${currentDomain}_note`]: "",
        [`${currentDomain}_position`]: null,
        [`${currentDomain}_minimized`]: false
      }, function(items) {
        resolve({
          note: items[`${currentDomain}_note`] || "",
          position: items[`${currentDomain}_position`] || null,
          minimized: items[`${currentDomain}_minimized`] || false
        });
      });
    });
  }
  
  // Save note to storage
  function saveNote(noteText) {
    chrome.storage.sync.set({ [`${currentDomain}_note`]: noteText });
  }
  
  // Save position to storage
  function savePosition(left, top) {
    chrome.storage.sync.set({ [`${currentDomain}_position`]: { left, top } });
  }
  
  // Save minimized state
  function saveMinimizedState(isMinimized) {
    chrome.storage.sync.set({ [`${currentDomain}_minimized`]: isMinimized });
  }
  
  // Create and inject the note container
  async function createNoteContainer() {
    // Wait for note data to load
    const noteData = await loadNoteData();
    
    // Create the main container
    const noteDiv = document.createElement('div');
    noteDiv.setAttribute('id', 'domain-note-container');
    noteDiv.style.position = 'fixed';
    
    // Set position from saved data or random position
    if (noteData.position) {
      noteDiv.style.left = `${noteData.position.left}px`;
      noteDiv.style.top = `${noteData.position.top}px`;
    } else {
      noteDiv.style.top = Math.floor(Math.random() * (window.innerHeight-150)) + 'px';
      noteDiv.style.left = Math.floor(Math.random() * (window.innerWidth-250)) + 'px';
    }
    
    noteDiv.style.borderRadius = '15px';
    noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.7)'; // 70% opacity by default
    noteDiv.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"; // ease-in-out for all properties
    noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.7)";
    noteDiv.style.padding = '10px';
    noteDiv.style.zIndex = '9999';
    
    // Set initial state (minimized or normal)
    if (noteData.minimized) {
      // Minimized state
      noteDiv.style.width = "15px";
      noteDiv.style.height = "15px";
      noteDiv.style.borderRadius = "50%";
      noteDiv.style.padding = "0";
      noteDiv.style.cursor = "pointer";
      noteDiv.dataset.minimized = "true";
    } else {
      // Normal state
      noteDiv.style.minWidth = "200px";
      noteDiv.style.minHeight = "100px";
      noteDiv.dataset.minimized = "false";
    }
    
    // Create the textarea (only for normal state)
    const noteTextarea = document.createElement('textarea');
    noteTextarea.value = noteData.note;
    noteTextarea.placeholder = `Notes for ${currentDomain}...`;
    noteTextarea.style.width = "100%";
    noteTextarea.style.height = "100%";
    noteTextarea.style.minHeight = "80px";
    noteTextarea.style.backgroundColor = "transparent";
    noteTextarea.style.border = "none";
    noteTextarea.style.outline = "none";
    noteTextarea.style.resize = "both";
    noteTextarea.style.color = "#000";
    noteTextarea.style.fontFamily = 'Arial, sans-serif';
    noteTextarea.style.fontSize = '14px';
    
    // Save changes when text is edited
    noteTextarea.addEventListener('input', () => {
      saveNote(noteTextarea.value);
    });
    
    // Only add textarea if not minimized
    if (!noteData.minimized) {
      noteDiv.appendChild(noteTextarea);
    }
    
    // Create button container (for non-minimized state)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = "5px";
    buttonContainer.style.right = "5px";
    buttonContainer.style.display = noteData.minimized ? "none" : "block";
    
    // Create minimize button
    const minimizeButton = document.createElement("button");
    minimizeButton.style.color = "#000";
    minimizeButton.style.border = "none";
    minimizeButton.style.backgroundColor = "transparent";
    minimizeButton.style.cursor = "pointer";
    minimizeButton.style.fontSize = "14px";
    minimizeButton.style.padding = "0 5px";
    minimizeButton.style.marginRight = "5px";
    minimizeButton.style.lineHeight = "1";
    minimizeButton.innerHTML = "&#8722;"; // Minus symbol
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.style.color = "#000";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "14px";
    closeButton.style.padding = "0";
    closeButton.style.lineHeight = "1";
    closeButton.innerHTML = "&#10006;"; // Close symbol (X)
    
    // Add buttons to container
    buttonContainer.appendChild(minimizeButton);
    buttonContainer.appendChild(closeButton);
    
    // Only add button container if not minimized
    if (!noteData.minimized) {
      noteDiv.appendChild(buttonContainer);
    }
    
    // Function to minimize the note
    function minimizeNote() {
      // Save current content and minimized state
      saveNote(noteTextarea.value);
      saveMinimizedState(true);
      
      // Remove content
      while (noteDiv.firstChild) {
        noteDiv.removeChild(noteDiv.firstChild);
      }
      
      // Animate to minimized state
      noteDiv.style.width = "15px";
      noteDiv.style.height = "15px";
      noteDiv.style.minWidth = "15px";
      noteDiv.style.minHeight = "15px";
      noteDiv.style.borderRadius = "50%";
      noteDiv.style.padding = "0";
      noteDiv.style.cursor = "pointer";
      noteDiv.dataset.minimized = "true";
    }
    
    // Function to maximize the note
    function maximizeNote() {
      // Update minimized state
      saveMinimizedState(false);
      
      // Animate to normal state
      noteDiv.style.width = "200px";
      noteDiv.style.height = "100px";
      noteDiv.style.minWidth = "200px";
      noteDiv.style.minHeight = "100px";
      noteDiv.style.borderRadius = "15px";
      noteDiv.style.padding = "10px";
      noteDiv.style.cursor = "default";
      noteDiv.dataset.minimized = "false";
      
      // Add textarea back
      noteDiv.appendChild(noteTextarea);
      noteDiv.appendChild(buttonContainer);
    }
    
    // Toggle minimize/maximize when clicked if minimized
    noteDiv.addEventListener("click", (event) => {
      if (noteDiv.dataset.minimized === "true" && event.target === noteDiv) {
        maximizeNote();
      }
    });
    
    // Add event listener to minimize button
    minimizeButton.addEventListener("click", () => {
      minimizeNote();
    });
    
    // Add event listener to close button
    closeButton.addEventListener("click", () => {
      document.body.removeChild(noteDiv);
    });
    
    // Handle hover effects for background opacity
    noteDiv.addEventListener("mouseenter", () => {
      noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 1)'; // 100% opacity on hover
      noteDiv.style.border = "2px solid rgba(0, 0, 0, 1)";
    });
    
    noteDiv.addEventListener("mouseleave", () => {
      noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.7)'; // Back to 70% opacity
      noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.7)";
    });
    
    // Make the div draggable
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    
    noteDiv.addEventListener("mousedown", (event) => {
      // Don't start dragging if we're clicking on interactive elements
      if (noteDiv.dataset.minimized === "true") {
        // For minimized state, allow dragging with simple click
        // but also trigger the click event when released
        isDragging = false;
        offset = {
          x: event.clientX - noteDiv.offsetLeft,
          y: event.clientY - noteDiv.offsetTop,
        };
        
        // Small timeout to see if it's a drag or click
        setTimeout(() => {
          isDragging = true;
        }, 100);
        
      } else if (event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'BUTTON') {
        // For normal state, only drag when clicking on the container (not controls)
        isDragging = true;
        offset = {
          x: event.clientX - noteDiv.offsetLeft,
          y: event.clientY - noteDiv.offsetTop,
        };
      }
    });
    
    noteDiv.addEventListener("mouseup", (event) => {
      // Save position after dragging ends
      if (isDragging) {
        savePosition(parseInt(noteDiv.style.left), parseInt(noteDiv.style.top));
      }
      isDragging = false;
    });
    
    noteDiv.addEventListener("mousemove", (event) => {
      if (isDragging) {
        const left = event.clientX - offset.x;
        const top = event.clientY - offset.y;
        noteDiv.style.left = `${left}px`;
        noteDiv.style.top = `${top}px`;
      }
    });
    
    // Append note container to body
    document.body.appendChild(noteDiv);
  }
  
  // Initialize the extension
  createNoteContainer();