// Function to extract domain from current URL
function getDomain() {
    const url = window.location.hostname;
    return url;
  }
  
  // Initialize notes container and storage
  let domainNotes = [];
  const currentDomain = getDomain();
  
  // Load domain-specific notes from storage
  function loadNotes() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [currentDomain]: [] }, function(items) {
        domainNotes = items[currentDomain] || [];
        resolve();
      });
    });
  }
  
  // Save notes to storage
  function saveNotes() {
    chrome.storage.sync.set({ [currentDomain]: domainNotes });
  }
  
  // Create and inject the notes container
  async function createNotesContainer() {
    // Wait for notes to load
    await loadNotes();
    
    // Create the main container
    const notesDiv = document.createElement('div');
    notesDiv.setAttribute('id', 'domain-notes-container');
    notesDiv.style.position = 'fixed';
    notesDiv.style.top = Math.floor(Math.random() * (window.innerHeight-200)) + 'px';
    notesDiv.style.left = Math.floor(Math.random() * (window.innerWidth-250)) + 'px';
    notesDiv.style.borderRadius = '20px';
    notesDiv.style.backgroundColor = 'rgba(255, 204, 0, 1)';
    notesDiv.style.color = '#000';
    notesDiv.style.fontFamily = 'Arial, sans-serif';
    notesDiv.style.fontSize = '16px';
    notesDiv.style.padding = '30px';
    notesDiv.style.zIndex = '9999';
    notesDiv.style.transition = "background-color 0.2s ease-in";
    notesDiv.style.border = "3px solid black";
    notesDiv.style.minWidth = "200px";
    notesDiv.style.maxWidth = "300px";
    notesDiv.style.maxHeight = "400px";
    notesDiv.style.overflowY = "auto";
    
    // Create header with domain name
    const headerDiv = document.createElement('div');
    headerDiv.style.marginBottom = '15px';
    headerDiv.style.fontWeight = 'bold';
    headerDiv.textContent = `Notes for ${currentDomain}`;
    notesDiv.appendChild(headerDiv);
    
    // Create notes list
    const notesList = document.createElement('div');
    notesList.setAttribute('id', 'domain-notes-list');
    
    // Add existing notes
    if (domainNotes.length > 0) {
      domainNotes.forEach((note, index) => {
        const noteElement = createNoteElement(note, index);
        notesList.appendChild(noteElement);
      });
    } else {
      // Add default note if no notes exist
      const defaultNote = "Add your notes here for this website";
      domainNotes.push(defaultNote);
      const noteElement = createNoteElement(defaultNote, 0);
      notesList.appendChild(noteElement);
      saveNotes();
    }
    
    notesDiv.appendChild(notesList);
    
    // Add new note button
    const addButton = document.createElement('button');
    addButton.textContent = "+ Add Note";
    addButton.style.marginTop = '10px';
    addButton.style.padding = '5px 10px';
    addButton.style.borderRadius = '5px';
    addButton.style.border = '1px solid black';
    addButton.style.backgroundColor = '#fff';
    addButton.style.cursor = 'pointer';
    
    addButton.addEventListener('click', () => {
      const newNote = "New note";
      domainNotes.push(newNote);
      const noteElement = createNoteElement(newNote, domainNotes.length - 1);
      notesList.appendChild(noteElement);
      saveNotes();
    });
    
    notesDiv.appendChild(addButton);
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.color = "#000";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "16px";
    closeButton.innerHTML = "&#10006;"; // Close symbol (X)
    
    // Add event listener to close button
    closeButton.addEventListener("click", () => {
      document.body.removeChild(notesDiv);
    });
    
    notesDiv.appendChild(closeButton);
    
    // Make the div draggable
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    
    notesDiv.addEventListener("mousedown", (event) => {
      // Don't start dragging if we're clicking on an input or button
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      isDragging = true;
      offset = {
        x: event.clientX - notesDiv.offsetLeft,
        y: event.clientY - notesDiv.offsetTop,
      };
    });
    
    notesDiv.addEventListener("mouseup", () => {
      isDragging = false;
    });
    
    notesDiv.addEventListener("mousemove", (event) => {
      if (isDragging) {
        const left = event.clientX - offset.x;
        const top = event.clientY - offset.y;
        notesDiv.style.left = `${left}px`;
        notesDiv.style.top = `${top}px`;
      }
    });
    
    document.body.appendChild(notesDiv);
  }
  
  // Function to create editable note elements
  function createNoteElement(noteText, index) {
    const noteContainer = document.createElement('div');
    noteContainer.style.marginBottom = '10px';
    noteContainer.style.position = 'relative';
    
    const noteTextarea = document.createElement('textarea');
    noteTextarea.value = noteText;
    noteTextarea.style.width = "100%";
    noteTextarea.style.minHeight = "50px";
    noteTextarea.style.padding = "5px";
    noteTextarea.style.borderRadius = "5px";
    noteTextarea.style.border = "1px solid #ccc";
    noteTextarea.style.resize = "vertical";
    noteTextarea.style.fontFamily = 'Arial, sans-serif';
    noteTextarea.style.fontSize = '14px';
    
    // Save changes when text is edited
    noteTextarea.addEventListener('change', () => {
      domainNotes[index] = noteTextarea.value;
      saveNotes();
    });
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = "&#10006;";
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "5px";
    deleteButton.style.right = "5px";
    deleteButton.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "50%";
    deleteButton.style.width = "20px";
    deleteButton.style.height = "20px";
    deleteButton.style.padding = "0";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.display = "none"; // Initially hidden
    
    // Show delete button on hover
    noteContainer.addEventListener('mouseenter', () => {
      deleteButton.style.display = "block";
    });
    
    noteContainer.addEventListener('mouseleave', () => {
      deleteButton.style.display = "none";
    });
    
    // Delete note when button is clicked
    deleteButton.addEventListener('click', () => {
      domainNotes.splice(index, 1);
      saveNotes();
      noteContainer.remove();
      
      // Update indices for remaining notes
      const notesList = document.getElementById('domain-notes-list');
      const noteElements = notesList.children;
      for (let i = index; i < noteElements.length; i++) {
        const deleteBtn = noteElements[i].querySelector('button');
        const textarea = noteElements[i].querySelector('textarea');
        
        // Update event listeners with new indices
        const newIndex = i;
        const newDeleteBtn = deleteBtn.cloneNode(true);
        const newTextarea = textarea.cloneNode(true);
        
        newDeleteBtn.addEventListener('click', () => {
          domainNotes.splice(newIndex, 1);
          saveNotes();
          noteElements[newIndex].remove();
        });
        
        newTextarea.addEventListener('change', () => {
          domainNotes[newIndex] = newTextarea.value;
          saveNotes();
        });
        
        // Replace old elements with new ones
        noteElements[i].replaceChild(newDeleteBtn, deleteBtn);
        noteElements[i].replaceChild(newTextarea, textarea);
      }
    });
    
    noteContainer.appendChild(noteTextarea);
    noteContainer.appendChild(deleteButton);
    
    return noteContainer;
  }
  
  // Initialize the extension
  createNotesContainer();