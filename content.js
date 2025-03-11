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
          minimized: items[`${currentDomain}_minimized`] || true
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
    
    // Set position from saved data or default to left bottom corner
    if (noteData.position) {
      noteDiv.style.left = `${noteData.position.left}px`;
      noteDiv.style.top = `${noteData.position.top}px`;
    } else {
      // Initial position in pixels (not using bottom property)
      const initialLeft = 20;
      const initialTop = window.innerHeight - 40; // 20px from bottom
      noteDiv.style.left = `${initialLeft}px`;
      noteDiv.style.top = `${initialTop}px`;
      
      // Store this initial position
      setTimeout(() => {
        savePosition(initialLeft, initialTop);
      }, 100);
    }
    
    noteDiv.style.borderRadius = '15px';
    noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.5)'; // 50% opacity by default
    noteDiv.style.transition = "background-color 0.3s, border 0.3s, width 0.3s, height 0.3s, border-radius 0.3s, padding 0.3s";
    noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.3)";
    noteDiv.style.padding = '10px 20px 10px 10px';
    noteDiv.style.zIndex = '9999';
    // Add user-select: none to prevent text selection while dragging
    noteDiv.style.userSelect = 'none';
    noteDiv.style.webkitUserSelect = 'none';
    noteDiv.style.msUserSelect = 'none';
    
    // Set initial state (minimized or normal)
    if (noteData.minimized) {
      // Minimized state
      noteDiv.style.width = "15px";
      noteDiv.style.height = "15px";
      noteDiv.style.borderRadius = "50%";
      noteDiv.style.padding = "0";
    //   noteDiv.style.cursor = "pointer";
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
    noteTextarea.style.resize = "none";
    noteTextarea.style.color = "#000";
    noteTextarea.style.boxShadow = "none";
    noteTextarea.style.fontFamily = 'Arial, sans-serif';
    noteTextarea.style.fontSize = '14px';
    // Allow selection in the textarea
    noteTextarea.style.userSelect = 'text';
    noteTextarea.style.webkitUserSelect = 'text';
    noteTextarea.style.msUserSelect = 'text';
    
    // Save changes when text is edited
    noteTextarea.addEventListener('input', () => {
      saveNote(noteTextarea.value);
    });
    
    // Only add textarea if not minimized
    if (!noteData.minimized) {
      noteDiv.appendChild(noteTextarea);
    }
    
    // Create close button container (for non-minimized state)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = "5px";
    buttonContainer.style.right = "5px";
    buttonContainer.style.display = noteData.minimized ? "none" : "block";
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.style.color = "#000";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    // closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "14px";
    closeButton.style.padding = "0";
    closeButton.style.lineHeight = "1";
    closeButton.innerHTML = "&#10006;"; // Close symbol (X)
    
    // Add close button to container
    // buttonContainer.appendChild(closeButton);
    
    // Only add button container if not minimized
    // if (!noteData.minimized) {
    //   noteDiv.appendChild(buttonContainer);
    // }
    
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
    //   noteDiv.style.cursor = "pointer";
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
      noteDiv.style.padding = "10px 20px 10px 10px";
    //   noteDiv.style.cursor = "default";
      noteDiv.dataset.minimized = "false";
      
      // Add textarea back
      noteDiv.appendChild(noteTextarea);
      
      // Create fresh buttonContainer and buttons
      const freshButtonContainer = document.createElement('div');
      freshButtonContainer.style.position = "absolute";
      freshButtonContainer.style.top = "5px";
      freshButtonContainer.style.right = "5px";
      
      const freshCloseButton = document.createElement("button");
      freshCloseButton.style.color = "#000";
      freshCloseButton.style.border = "none";
      freshCloseButton.style.backgroundColor = "transparent";
    //   freshCloseButton.style.cursor = "pointer";
      freshCloseButton.style.fontSize = "14px";
      freshCloseButton.style.padding = "0";
      freshCloseButton.style.lineHeight = "1";
      freshCloseButton.innerHTML = "&#10006;"; // Close symbol (X)
      
      freshCloseButton.addEventListener("click", () => {
        document.body.removeChild(noteDiv);
      });
      
    //   freshButtonContainer.appendChild(freshCloseButton);
    //   noteDiv.appendChild(freshButtonContainer);
    }
    
    // Toggle minimize/maximize on double click
    noteDiv.addEventListener("dblclick", (event) => {
      // Prevent double click on textarea and close button
      if (event.target === noteTextarea || event.target.tagName === 'BUTTON') {
        return;
      }
      
      if (noteDiv.dataset.minimized === "true") {
        maximizeNote();
      } else {
        minimizeNote();
      }
      
      // Prevent any default behavior like text selection
      event.preventDefault();
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
    
    // Improved dragging functionality
    let isDragging = false;
    let initialX, initialY;
    let initialLeft, initialTop;
    let lastClickTime = 0;
    
    // This helps prevent text selection issues during drag
    function preventDefaultDragEvents(e) {
      if (isDragging) {
        e.preventDefault();
        return false;
      }
      return true;
    }
    
    noteDiv.addEventListener("mousedown", (event) => {
      // Don't trigger dragging if clicking on textarea or buttons
      if (event.target === noteTextarea || event.target.tagName === 'BUTTON') {
        return;
      }
      
      // Store initial positions
      initialX = event.clientX;
      initialY = event.clientY;
      initialLeft = parseInt(noteDiv.style.left) || 0;
      initialTop = parseInt(noteDiv.style.top) || 0;
      
      // Handling for both minimized and normal states
      if (event.target !== noteTextarea && event.target.tagName !== 'BUTTON') {
        // Store initial positions
        initialX = event.clientX;
        initialY = event.clientY;
        initialLeft = parseInt(noteDiv.style.left) || 0;
        initialTop = parseInt(noteDiv.style.top) || 0;
        isDragging = true;
        
        // Apply cursor style
        // noteDiv.style.cursor = 'grabbing';
        
        // Add window-level event listener for smoother dragging
        const onMouseMove = (moveEvent) => {
          if (isDragging) {
            moveEvent.preventDefault();
            const left = initialLeft + (moveEvent.clientX - initialX);
            const top = initialTop + (moveEvent.clientY - initialY);
            noteDiv.style.left = `${left}px`;
            noteDiv.style.top = `${top}px`;
          }
        };
        
        const onMouseUp = (upEvent) => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          
          if (isDragging) {
            // Only consider it a drag if moved more than 5px
            if (Math.abs(upEvent.clientX - initialX) > 5 || Math.abs(upEvent.clientY - initialY) > 5) {
              // Reset cursor and save position
            //   noteDiv.style.cursor = noteDiv.dataset.minimized === "true" ? 'pointer' : 'default';
              savePosition(parseInt(noteDiv.style.left), parseInt(noteDiv.style.top));
            }
            isDragging = false;
          }
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    });
    
    // Prevent default selection behavior anywhere in the document during drag
    document.addEventListener('selectstart', preventDefaultDragEvents);
    
    // Append note container to body
    document.body.appendChild(noteDiv);
  }
  
  // Initialize the extension
  createNoteContainer();