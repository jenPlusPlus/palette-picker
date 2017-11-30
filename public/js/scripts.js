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

const addErrorClass = (projectID) => {
  $(`#no-palette-${projectID}`).addClass('error-no-palettes');
}

const addPalettesToPage = (palette, projectID) => {
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

    if(!$(`#no-palette-${projectID}`).hasClass('error-no-palettes')) {
      $(`#no-palette-${projectID}`).remove();
    }
    $(`#project-${projectID}-palettes`).append(paletteHTML);
}

const getAllPalettesForProject = (project) => {
  fetch(`/api/v1/projects/${project.id}/palettes`)
  .then(palettes => palettes.json())
  .then(parsedPalettes => {
    if(parsedPalettes.error) {
      addErrorClass(project.id);
      console.log(project.name + ' error: ' + parsedPalettes.error);
    } else {
      parsedPalettes.forEach(palette => {
        addPalettesToPage(palette, project.id);
      });
    }
  })
  .catch(error => console.log(error))
}

const addProjectToPage = (project) => {
  const projectHTML =
  `<li key='project-${project.id}' class='project'>
    <h3 class='project-name'>${project.name}</h3>
    <ul class='palettes-list' id='project-${project.id}-palettes'>
      <li key='no-palette-${project.id}' id='no-palette-${project.id}' class='no-palette'>You haven't added any palettes to this project yet.</li>
    </ul>
  </li>`;
  $('.projects-list').append(projectHTML);
  $('#project-folders').append(new Option(`${project.name}`, `${project.name}`, false, true));
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

  $('#project-name-input').val('');
}

window.onload = () => {
  assignColors();
  getAllProjects();
};

$('#generate-palette-button').on('click', assignColors);
$('.lock-button').on('click', lockColor);
$('#save-project-button').on('click', saveProject);
