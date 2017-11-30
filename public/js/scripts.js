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

const addPalettesToPage = (palette, projectID) => {
  console.log('palette: ', palette);
  const paletteHTML = `
    <li key='palette-${palette.id}' class='palette'>
      <p class='palette-name'>${palette.name}</p>
      <div class='palette-colors-container'>
        <div class='palette-colors' id='color-${palette.color1}'></div>
        <div class='palette-colors' id='color-${palette.color2}'></div>
        <div class='palette-colors' id='color-${palette.color3}'></div>
        <div class='palette-colors' id='color-${palette.color4}'></div>
        <div class='palette-colors' id='color-${palette.color5}'></div>
      </div>
      <button class='delete-palette-button'>Delete</button>
    </li>`;

    $(`#project-${projectID}-palettes`).append(paletteHTML);
}

const getAllPalettesForProject = (project) => {
  fetch(`/api/v1/projects/${project.id}/palettes`)
  .then(palettes => palettes.json())
  .then(parsedPalettes => {
    if(parsedPalettes.error) {
      console.log(project.name + ' : ' + parsedPalettes.error);
    } else {
      parsedPalettes.forEach(palette => {
        addPalettesToPage(palette, project.id);
      });
    }
  })
  .catch(error => console.log(error))
}

const addProjectToPage = (project) => {
  console.log('project: ', project);
  const projectHTML =
  `<li key='project-${project.id}' class='project'>
    <h3 class='project-name'>${project.name}</h3>
    <ul class='palettes-list' id='project-${project.id}-palettes'></ul>
  </li>`;
  $('.projects-list').append(projectHTML);
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

const saveProject = (event) => {
  event.preventDefault();
  console.log('save project!!!');
  const projectName = $('#project-name-input').val();
  console.log('projectName: ', projectName);
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
    console.log('addedProject: ', addedProject);
    addProjectToPage(addedProject);
  })
  .catch(error => console.log(error))

  $('#project-name-input').val('');
}

window.onload = () => {
  assignColors();
  getAllProjects();
};

$('#generate-palette-button').on('click', assignColors);
$('.lock-button').on('click', lockColor);
$('#save-project-button').on('click', saveProject);
