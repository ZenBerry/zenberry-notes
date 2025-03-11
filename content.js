const style = document.createElement("style");
style.textContent = "textarea::placeholder { color: rgba(0, 0, 0, 0.3); }";
document.head.appendChild(style);


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
          [`zenberry_notes_v2_${currentDomain}_note`]: "",
          [`zenberry_notes_v2_${currentDomain}_position`]: null,
          [`zenberry_notes_v2_${currentDomain}_minimized`]: true
      }, function (items) {
          resolve({
              note: items[`zenberry_notes_v2_${currentDomain}_note`] || "",
              position: items[`zenberry_notes_v2_${currentDomain}_position`] || null,
              minimized: items[`zenberry_notes_v2_${currentDomain}_minimized`] || true
          });
      });
  });
}

// Save note to storage
function saveNote(noteText) {
  chrome.storage.sync.set({ [`zenberry_notes_v2_${currentDomain}_note`]: noteText });
}

// Save position to storage
function savePosition(left, top) {
  chrome.storage.sync.set({ [`zenberry_notes_v2_${currentDomain}_position`]: { left, top } });
}

// Save minimized state
function saveMinimizedState(isMinimized) {
  chrome.storage.sync.set({ [`zenberry_notes_v2_${currentDomain}_minimized`]: isMinimized });
}

// Create and inject the note container
async function createNoteContainer() {
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
      const initialLeft = 20;
      const initialTop = window.innerHeight - 40; // 20px from bottom
      noteDiv.style.left = `${initialLeft}px`;
      noteDiv.style.top = `${initialTop}px`;

      setTimeout(() => savePosition(initialLeft, initialTop), 100);
  }

  noteDiv.style.borderRadius = '15px';
  noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.7)';
  noteDiv.style.transition = "background-color 0.3s, border 0.3s, width 0.3s, height 0.3s, min-width 0.3s, min-height 0.3s, border-radius 0.3s, padding 0.3s, transform 0.3s, opacity 0.3s, pointer-events 0.3s ease-in-out";
  noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.3)";
  noteDiv.style.padding = '10px';
  noteDiv.style.zIndex = '9999';
  noteDiv.style.userSelect = 'none';

  // Create the textarea
  const noteTextarea = document.createElement('textarea');
  noteTextarea.value = noteData.note;
  noteTextarea.placeholder = `Notes for ${currentDomain}`;
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
  noteTextarea.style.transition = "all 0.3s ease";

  noteTextarea.setAttribute("data-gramm", "false");
  noteTextarea.setAttribute("data-gramm_editor", "false");
  noteTextarea.setAttribute("data-enable-grammarly", "false");

  noteTextarea.addEventListener('input', () => saveNote(noteTextarea.value));

  noteDiv.appendChild(noteTextarea);

  // Handle hover effects for background opacity
  noteDiv.addEventListener("mouseenter", () => {
    noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.9)'; // 100% opacity on hover
    noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.9)";
  });
  
  noteDiv.addEventListener("mouseleave", () => {
    noteDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.5)'; // Back to 70% opacity
    noteDiv.style.border = "2px solid rgba(0, 0, 0, 0.5)";
  });

  // Set initial state
  function applyMinimizedState(minimized) {
      if (minimized) {
          noteDiv.style.width = "15px";
          noteDiv.style.height = "15px";
          noteDiv.style.borderRadius = "50%";
          noteDiv.style.padding = "0";
          noteTextarea.style.transform = "scale(0)";
          noteTextarea.style.opacity = "0";
          noteTextarea.style.pointerEvents = "none";
      } else {
          const expandedWidth = 200;
          const expandedHeight = 100;
          let newLeft = parseInt(noteDiv.style.left);
          let newTop = parseInt(noteDiv.style.top);
  
          // Check if the note would go outside the viewport
          if (newLeft + expandedWidth > window.innerWidth) {
              newLeft = window.innerWidth - expandedWidth - 20; // Keep 20px margin
              noteDiv.style.transition = "left 0.3s ease, top 0.3s ease";
          }
          if (newTop + expandedHeight > window.innerHeight) {
              newTop = window.innerHeight - expandedHeight - 20;
              noteDiv.style.transition = "left 0.3s ease, top 0.3s ease";
          }
  
          // Apply smooth transition for movement

  
          noteDiv.style.left = `${newLeft}px`;
          noteDiv.style.top = `${newTop}px`;
          savePosition(newLeft, newTop);
  
          noteDiv.style.width = `${expandedWidth}px`;
          noteDiv.style.height = `${expandedHeight}px`;
          noteDiv.style.borderRadius = "15px";
          noteDiv.style.padding = "10px";
          noteTextarea.style.transform = "scale(1)";
          noteTextarea.style.opacity = "1";
          noteTextarea.style.pointerEvents = "auto";
  
          // Remove transition after movement completes
          setTimeout(() => {
              noteDiv.style.transition = "background-color 0.3s, border 0.3s, width 0.3s, height 0.3s, min-width 0.3s, min-height 0.3s, border-radius 0.3s, padding 0.3s, transform 0.3s, opacity 0.3s, pointer-events 0.3s";
          }, 300);
      }
  }
  

  applyMinimizedState(noteData.minimized);

  // Toggle minimize/maximize on double click
  noteDiv.addEventListener("dblclick", (event) => {
      if (event.target === noteTextarea) return;

      const isMinimized = noteDiv.style.width === "15px";
      saveMinimizedState(!isMinimized);
      applyMinimizedState(!isMinimized);

      event.preventDefault();
  });

  // Dragging functionality
  let isDragging = false, initialX, initialY, initialLeft, initialTop;

  noteDiv.addEventListener("mousedown", (event) => {
      if (event.target === noteTextarea) return;

      initialX = event.clientX;
      initialY = event.clientY;
      initialLeft = parseInt(noteDiv.style.left) || 0;
      initialTop = parseInt(noteDiv.style.top) || 0;
      isDragging = true;

      const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          moveEvent.preventDefault();
          noteDiv.style.left = `${initialLeft + (moveEvent.clientX - initialX)}px`;
          noteDiv.style.top = `${initialTop + (moveEvent.clientY - initialY)}px`;
      };

      const onMouseUp = () => {
          isDragging = false;
          savePosition(parseInt(noteDiv.style.left), parseInt(noteDiv.style.top));
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
  });

  document.body.appendChild(noteDiv);
}

// Initialize the extension
createNoteContainer();
