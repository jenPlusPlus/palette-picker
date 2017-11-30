const getRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateRandomColor = () => {
  const characters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += characters[getRandomNumber(0, 15)];
  };
  return color;
};

const assignColors = () => {
  for (let i = 1; i < 6; i++) {
    if(!$(`#color-${i}`).hasClass('locked')) {
      const color = generateRandomColor();
      $(`#color-${i}`).css('background-color', color);
      $(`#color-hex-${i}`).text(color);
    }
  };
}

const lockColor = (event) => {
  event.preventDefault();
  $(event.target).parents('.palette-color').toggleClass('locked');
}

const toggleErrorClass = (projectID) => {
  $(`#no-palette-${projectID}`).toggleClass('error-no-palettes');
}

const movePaletteToGenerator = (event) => {
  event.preventDefault();
  for (let i = 1; i < 6; i++) {
    $(`#color-${i}`).css('background-color', event.data[i-1]);
    $(`#color-hex-${i}`).text(event.data[i-1]);
  }
}

const addPaletteToPage = (palette, projectID) => {
  const paletteHTML = `
    <li key='palette-${palette.id}' id='palette-${palette.id}' class='palette' data-id=${palette.id}>
      <p class='palette-name saved-palette-${palette.id}'>${palette.name}</p>
      <div class='palette-colors-container'>
        <div class='palette-colors saved-palette-${palette.id}' id='color-${palette.color1}' style='background-color: ${palette.color1}'></div>
        <div class='palette-colors saved-palette-${palette.id}' id='color-${palette.color2}' style='background-color: ${palette.color2}'></div>
        <div class='palette-colors saved-palette-${palette.id}' id='color-${palette.color3}' style='background-color: ${palette.color3}'></div>
        <div class='palette-colors saved-palette-${palette.id}' id='color-${palette.color4}' style='background-color: ${palette.color4}'></div>
        <div class='palette-colors saved-palette-${palette.id}' id='color-${palette.color5}' style='background-color: ${palette.color5}'></div>
      </div>
      <button class='delete-palette-button' id='delete-palette-${palette.id}'>Delete</button>
    </li>`;

    if(!$(`#no-palette-${projectID}`).hasClass('error-no-palettes')) {
      $(`#no-palette-${projectID}`).remove();
    }
    $(`#project-${projectID}-palettes`).append(paletteHTML);
    $(`#delete-palette-${palette.id}`).on('click', deletePalette);
    $(`.saved-palette-${palette.id}`).on('click', [
      palette.color1,
      palette.color2,
      palette.color3,
      palette.color4,
      palette.color5
    ], movePaletteToGenerator);
}

const getAllPalettesForProject = (project) => {
  fetch(`/api/v1/projects/${project.id}/palettes`)
  .then(palettes => palettes.json())
  .then(parsedPalettes => {
    if(parsedPalettes.error) {
      toggleErrorClass(project.id);
      console.log(project.name + ' error: ' + parsedPalettes.error);
    } else {
      parsedPalettes.forEach(palette => {
        addPaletteToPage(palette, project.id);
      });
    }
  })
  .catch(error => console.log(error))
}

const addProjectToPage = (project) => {
  const projectHTML =
  `<li key='project-${project.id}' class='project'>
    <h3 class='project-name'>${project.name}</h3>
    <ul class='palettes-list' id='project-${project.id}-palettes' data-id=${project.id}>
      <li key='no-palette-${project.id}' id='no-palette-${project.id}' class='no-palette'>No palettes</li>
    </ul>
  </li>`;
  $('.projects-list').append(projectHTML);
  $('#project-folders').append(new Option(`${project.name}`, project.id, false, true));
}

const getAllProjects = () => {
  fetch('/api/v1/projects')
  .then(projects => projects.json())
  .then(parsedProjects => {
    parsedProjects.forEach(project => {
      addProjectToPage(project);
      getAllPalettesForProject(project);
    })
  })
  .catch(error => console.log(error))
}

const alertDuplicate = (projectName) => {
  const duplicateMessage = `<p id='duplicate-message' class='duplicate'>Project named ${projectName} already exists.</p>
  <button id='delete-duplicate-message-button' class='duplicate'>X</button>`

  $('.palette-generator').append(duplicateMessage);
  $('#delete-duplicate-message-button').on('click', () => $('.duplicate').remove());
}

const checkIfProjectExists = (event) => {
  event.preventDefault();

  const projectName = $('#project-name-input').val();

  fetch('/api/v1/projects')
  .then(projects => projects.json())
  .then(parsedProjects => {
    const existingProject = parsedProjects.find(project => {
      return project.name === projectName;
    })
    return existingProject;
  })
  .then(foundProject => {
    if(foundProject) {
      alertDuplicate(projectName);
      $('#project-name-input').val('');
    } else {
      saveProject(event);
      $('#project-name-input').val('');
    }
  })
  .catch(error => console.log(error))

}

const saveProject = (event) => {
  event.preventDefault();

  const projectName = $('#project-name-input').val();

  fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: projectName })
  })
  .then(response => {
    if (response.status === 201) {
      return response.json()
    }
  })
  .then(addedProject => {
    addProjectToPage(addedProject);
  })
  .catch(error => console.log(error))

  $('#save-project-button').attr("disabled", true);
}

const savePalette = (event) => {
  event.preventDefault();
  const paletteName = $('#palette-name-input').val();
  const color1 = $('#color-hex-1').text();
  const color2 = $('#color-hex-2').text();
  const color3 = $('#color-hex-3').text();
  const color4 = $('#color-hex-4').text();
  const color5 = $('#color-hex-5').text();
  const projectID = $('#project-folders option:selected').val();

  fetch(`/api/v1/projects/${projectID}/palettes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: paletteName,
      color1: color1,
      color2: color2,
      color3: color3,
      color4: color4,
      color5: color5 })
  })
  .then(response => response.json())
  .then(addedPalette => {
    toggleErrorClass(projectID);
    addPaletteToPage(addedPalette, projectID);
  })
  .catch(error => console.log(error))

  $('#palette-name-input').val('');
  $('#save-palette-button').attr("disabled", true);
}

const deletePaletteDB = (event) => {
  event.preventDefault();
  const paletteID = $(event.target).parents('.palette').data('id');

  fetch(`/api/v1/palettes/${paletteID}`, {
    method: 'DELETE'
  })
  .catch(error => console.log(error))
}

const deletePaletteFromPage = (event) => {
  event.preventDefault();
  const projectID = $(event.target).parents('.palettes-list').data('id');
  $(event.target).parents('.palette').remove();
  if($(`#project-${projectID}-palettes`).children('.palette').length === 0) {
    $(`#project-${projectID}-palettes`).append(`<li key='no-palette-${projectID}' id='no-palette-${projectID}' class='no-palette'>No palettes</li>`)
  }
}

const deletePalette = (event) => {
  deletePaletteDB(event);
  deletePaletteFromPage(event);
}

const enableSavePaletteButton = () => {
  if($('#palette-name-input').val() != ''){
    $('#save-palette-button').attr("disabled", false);
  }
  else {
    $('#save-palette-button').attr("disabled", true);
  }
}

const enableSaveProjectButton = () => {
  if($('#project-name-input').val() != ''){
    $('#save-project-button').attr("disabled", false);
  } else {
    $('#save-project-button').attr("disabled", true);
  }
}

window.onload = () => {
  assignColors();
  getAllProjects();
};

$('#palette-name-input').on('keyup', enableSavePaletteButton);
$('#project-name-input').on('keyup', enableSaveProjectButton);
$('#generate-palette-button').on('click', assignColors);
$('.lock-button').on('click', lockColor);
$('#save-project-button').on('click', checkIfProjectExists);
$('#save-palette-button').on('click', savePalette);
