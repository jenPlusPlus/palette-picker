//eslint-disable-next-line
let db = new Dexie('palette-picker');

db.version(1).stores({
  projects: '++id, &name',
  palettes: '++id, name, color1, color2, color3, color4, color5, projectId'
});

const saveOfflineProject = (project) => {
  return db.projects.add(project);
};

const saveOfflinePalette = (palette) => {
  return db.palettes.add(palette);
};

const loadOfflineProjects = () => {
  return db.projects.toArray();
};

const loadOfflinePalettes = () => {
  return db.palettes.toArray();
};

const saveProjectToIndexedDB = (project) => {
  saveOfflineProject(project)
    .then(() => console.log('IndexedDB Success'))
    .catch(error => console.error('Error adding data to indexedDB', error));
};

const savePaletteToIndexedDB = (palette, project_id) => {
  saveOfflinePalette({
    name: palette.name,
    color1: palette.color1,
    color2: palette.color2,
    color3: palette.color3,
    color4: palette.color4,
    color5: palette.color5,
    project_Id: palette.project_Id
  })
    .then(() => console.log('IndexedDB Success'))
    .catch(error => console.error('Error adding data to indexedDB', error));
};

const getAllOfflinePalettesForProject = (id) => {

  loadOfflinePalettes(id)
    .then(palettes =>  {

      const dbPalettes = palettes.filter(palette => {
        return parseInt(palette.project_Id) === id;
      });
      dbPalettes.forEach(palette => {
        addPaletteToPage(palette, id);
      });
    })
    .catch(error => console.error(error));
};

const getOfflineProjects = () => {
  loadOfflineProjects()
    .then(projects => {
      projects.forEach(project => {
        addProjectToPage(project);
        getAllOfflinePalettesForProject(project.id);
      });
    })
    .catch(error => console.error(error));
};

const getRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomColor = () => {
  const characters = '0123456789ABCDEF';
  let color = '#';
  for (let iter = 0; iter < 6; iter++) {
    color += characters[getRandomNumber(0, 15)];
  }
  return color;
};

const assignColors = () => {
  for (let iter = 1; iter < 6; iter++) {
    if (!$(`#color-${iter}`).hasClass('locked')) {
      const color = generateRandomColor();
      $(`#color-${iter}`).css('background-color', color);
      $(`#color-hex-${iter}`).text(color);
    }
  }
};

const lockColor = (event) => {
  event.preventDefault();
  $(event.target).parents('.palette-color').toggleClass('locked');
  $(event.target).toggleClass('lock-button-locked');
  if ($(event.target).attr('src') === './assets/unlocked_icon.svg') {
    $(event.target).attr('src', './assets/locked_icon.svg');
  } else {
    $(event.target).attr('src', './assets/unlocked_icon.svg');
  }
};

const toggleErrorClass = (projectID) => {
  $(`#no-palette-${projectID}`).toggleClass('no-palettes');
};

const movePaletteToGenerator = (event) => {
  event.preventDefault();
  for (let iter = 1; iter < 6; iter++) {
    $(`#color-${iter}`).css('background-color', event.data[iter-1]);
    $(`#color-hex-${iter}`).text(event.data[iter-1]);
  }
};

const addPaletteToPage = (palette, projectID) => {
  const paletteHTML = `
    <li key='palette-${palette.id}'
      id='palette-${palette.id}'
      class='palette'
      data-id=${palette.id}>
      <p class='palette-name saved-palette-${palette.id}'>${palette.name}</p>
      <div class='palette-colors-container'>
        <div class='palette-colors saved-palette-${palette.id}'
          id='color-${palette.color1}'
          style='background-color: ${palette.color1}'>
        </div>
        <div class='palette-colors saved-palette-${palette.id}'
          id='color-${palette.color2}'
          style='background-color: ${palette.color2}'>
        </div>
        <div class='palette-colors saved-palette-${palette.id}'
          id='color-${palette.color3}'
          style='background-color: ${palette.color3}'>
        </div>
        <div class='palette-colors saved-palette-${palette.id}'
          id='color-${palette.color4}'
          style='background-color: ${palette.color4}'></div>
        <div class='palette-colors saved-palette-${palette.id}'
          id='color-${palette.color5}'
          style='background-color: ${palette.color5}'>
        </div>
      </div>
      <div class='delete-palette-button'
        id='delete-palette-${palette.id}'>X</div>
    </li>`;

  if (!$(`#no-palette-${projectID}`).hasClass('error-no-palettes')) {
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
};

const getAllPalettesForProject = (project) => {
  fetch(`/api/v1/projects/${project.id}/palettes`)
    .then(palettes => palettes.json())
    .then(parsedPalettes => {
      if (parsedPalettes.error) {
        toggleErrorClass(project.id);
        console.log(project.name + ' error: ' + parsedPalettes.error);
      } else {
        parsedPalettes.forEach(palette => {
          addPaletteToPage(palette, project.id);
        });
      }
    })
    .catch(error => console.log(error));
};

const addProjectToPage = (project) => {
  const projectHTML =
  `<li key='project-${project.id}' class='project'>
    <h3 class='project-name'>${project.name}</h3>
    <ul class='palettes-list'
      id='project-${project.id}-palettes'
      data-id=${project.id}>
      <li key='no-palette-${project.id}'
        id='no-palette-${project.id}'
        class='no-palette'>No palettes</li>
    </ul>
  </li>`;
  $('.projects-list').append(projectHTML);
  $('#project-folders').append(`<option class='project-options'
  value=${project.id}
  id='option-${project.id}'
  selected>${project.name}</option>`);
  $(`#option-${project.id}`).siblings().removeAttr('selected');
};

const getAllProjects = () => {
  fetch('/api/v1/projects')
    .then(projects => projects.json())
    .then(parsedProjects => {
      parsedProjects.forEach(project => {
        addProjectToPage(project);
        $('.project-options').removeAttr('selected');
        getAllPalettesForProject(project);
      });
    })
    .catch(error => {
      console.log(error);
      getOfflineProjects();
    });
};

const alertDuplicate = (projectName) => {
  const duplicateMessage = `<p id='duplicate-message'
  class='duplicate'>Project named ${projectName} already exists.</p>
  <button id='delete-duplicate-message-button' class='duplicate'>X</button>`;

  $('.palette-generator').append(duplicateMessage);
  $('#delete-duplicate-message-button').on('click',
    () => $('.duplicate').remove());
};

const checkIfProjectExists = (event) => {
  event.preventDefault();

  const projectName = $('#project-name-input').val();

  fetch('/api/v1/projects')
    .then(projects => projects.json())
    .then(parsedProjects => {
      const existingProject = parsedProjects.find(project => {
        return project.name === projectName;
      });
      return existingProject;
    })
    .then(foundProject => {
      if (foundProject) {
        alertDuplicate(projectName);
        $('#project-name-input').val('');
      } else {
        saveProject(event);
        $('#project-name-input').val('');
      }
    })
    .catch(error => {
      console.log(error);
      loadOfflineProjects()
        .then(projects => {
          const existingProject = projects.find(project => {
            return project.name === projectName;
          });
          return existingProject;
        })
        .then(foundProject => {
          if (foundProject) {
            alertDuplicate(projectName);
            $('#project-name-input').val('');
          } else {
            saveProject(event);
            $('#project-name-input').val('');
          }
        })
        .catch(error => console.error(error));
    });

};

const saveProject = (event) => {
  event.preventDefault();

  const projectName = $('#project-name-input').val();

  saveProjectToIndexedDB({ name: projectName });

  fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: projectName })
  })
    .then(response => {
      if (response.status === 201) {
        return response.json();
      }
    })
    .then(addedProject => {
      addProjectToPage(addedProject);
    })
    .catch(error => {
      console.log(error);
      let id = '';
      db.projects.toCollection().last().then(result => {
        addProjectToPage({name: projectName, id: result.id});
      });

    });

  $('#save-project-button').attr("disabled", true);
};

const savePalette = (event) => {
  event.preventDefault();
  const paletteName = $('#palette-name-input').val();
  const color1 = $('#color-hex-1').text();
  const color2 = $('#color-hex-2').text();
  const color3 = $('#color-hex-3').text();
  const color4 = $('#color-hex-4').text();
  const color5 = $('#color-hex-5').text();
  const projectID = $('#project-folders option:selected').val();

  savePaletteToIndexedDB({name: paletteName,
    color1: color1,
    color2: color2,
    color3: color3,
    color4: color4,
    color5: color5,
    project_Id: projectID});

  fetch(`/api/v1/projects/${projectID}/palettes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: paletteName,
      color1: color1,
      color2: color2,
      color3: color3,
      color4: color4,
      color5: color5 })
  })
    .then(response => {

      response.json();
    })
    .then(addedPalette => {
      toggleErrorClass(projectID);
      addPaletteToPage(addedPalette, projectID);
    })
    .catch(error => {
      addPaletteToPage({
        name: paletteName,
        color1: color1,
        color2: color2,
        color3: color3,
        color4: color4,
        color5: color5}, projectID);
    });
  $('#palette-name-input').val('');
  $('#save-palette-button').attr('disabled', true);
};

const deletePaletteDB = (event) => {
  event.preventDefault();
  const paletteID = $(event.target).parents('.palette').data('id');

  fetch(`/api/v1/palettes/${paletteID}`, {
    method: 'DELETE'
  })
    .catch(error => console.log(error));
};

const deletePaletteFromPage = (event) => {
  event.preventDefault();
  const projectID = $(event.target).parents('.palettes-list').data('id');
  $(event.target).parents('.palette').remove();
  if ($(`#project-${projectID}-palettes`).children('.palette').length === 0) {
    $(`#project-${projectID}-palettes`).append(
      `<li key='no-palette-${projectID}'
      id='no-palette-${projectID}'
      class='no-palette'>No palettes</li>`);
  }
};

const deletePalette = (event) => {
  deletePaletteDB(event);
  deletePaletteFromPage(event);
};

const enableSavePaletteButton = () => {
  if ($('#palette-name-input').val() !== ''
  && $('#project-folders option:selected').val() !=='Choose a Project'){
    $('#save-palette-button').attr("disabled", false);
  } else {
    $('#save-palette-button').attr("disabled", true);
  }
};

const enableSaveProjectButton = () => {
  if ($('#project-name-input').val() !== ''){
    $('#save-project-button').attr('disabled', false);
  } else {
    $('#save-project-button').attr('disabled', true);
  }
};

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {

    // Load projects and palettes from indexedDB


    // Register a new service worker
    navigator.serviceWorker.register('../../service-worker.js')
      .then(registration => navigator.serviceWorker.ready)
      .then(registration => {
      //  Notification.requestPermission();
        console.log('ServiceWorker registration successful');
      }).catch(error => {
        console.log(`ServiceWorker registration failed: ${error}`);
      });

  });
}
