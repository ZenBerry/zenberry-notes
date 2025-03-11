// Function to extract domain from current URL
function getDomain() {
    return window.location.hostname;
  }
  
  // Initialize storage
  const currentDomain = getDomain();
  
  // Load domain-specific note from storage
  function loadNote() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [currentDomain]: "" }, function(items) {
        resolve(items[currentDomain] || "");
      });
    });
  }
  
  // Save note to storage
  function saveNote(noteText) {
    chrome.storage.sync.set({ [currentDomain]: noteText });
  }
  
  // Create and inject the note container
  async function createNoteContainer() {
    // Wait for note to load
    const savedNote = await loadNote();
    
    // Create the main container
    const noteDiv = document.createElement('div');
    noteDiv.setAttribute('id', 'domain-note-container');
    noteDiv.style.position = 'fixed';
    noteDiv.style.top = Math.floor(Math.random() * (window.innerHeight-150)) + 'px';
    noteDiv.style.left = Math.floor(Math.random() * (window.innerWidth-250)) + 'px';
    noteDiv.style.borderRadius = '15px';
    noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.7)'; // 70% opacity by default
    noteDiv.style.transition = "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"; // ease-in-out
    noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.7)";
    noteDiv.style.padding = '10px';
    noteDiv.style.zIndex = '9999';
    noteDiv.style.minWidth = "200px";
    noteDiv.style.minHeight = "100px";
    
    // Create the textarea
    const noteTextarea = document.createElement('textarea');
    noteTextarea.value = savedNote;
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
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "5px";
    closeButton.style.color = "#000";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "14px";
    closeButton.style.padding = "0";
    closeButton.style.lineHeight = "1";
    closeButton.innerHTML = "&#10006;"; // Close symbol (X)
    
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
      // Don't start dragging if we're clicking on the textarea or button
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'BUTTON') {
        return;
      }
      
      isDragging = true;
      offset = {
        x: event.clientX - noteDiv.offsetLeft,
        y: event.clientY - noteDiv.offsetTop,
      };
    });
    
    noteDiv.addEventListener("mouseup", () => {
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
    
    // Append elements to the note container
    noteDiv.appendChild(noteTextarea);
    noteDiv.appendChild(closeButton);
    document.body.appendChild(noteDiv);
  }
  
  // Initialize the extension
  createNoteContainer();