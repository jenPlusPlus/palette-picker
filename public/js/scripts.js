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

const addProjectsToPage = (project) => {
  console.log('project: ', project);
  const projectHTML = `<li key='project-${project.id}' class='project'>
    <h3 class='project-name'>${project.name}</h3>
    <ul class='palettes-list'>
      <li key=201 class='palette'>
        <p class='palette-name'>Palette Name 1</p>
        <div class='palette-colors-container'>
          <div class='palette-colors'></div>
          <div class='palette-colors'></div>
          <div class='palette-colors'></div>
          <div class='palette-colors'></div>
          <div class='palette-colors'></div>
        </div>
        <button class='delete-palette-button'>Delete</button>
      </li>`;
  $('.projects-list').append(projectHTML);
}

const getAllProjects = () => {
  fetch('/api/v1/projects')
  .then(projects => projects.json())
  .then(parsedProjects => {
    parsedProjects.forEach(project => {
      addProjectsToPage(project);
    })
  })
  .catch(error => console.log(error))
}

window.onload = () => {
  assignColors();
  getAllProjects();
};

$('#generate-palette-button').on('click', assignColors);
$('.lock-button').on('click', lockColor);
