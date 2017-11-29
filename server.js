const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Palette Picker';

app.locals.projects = [
  { id: '1', name: 'Project 1' },
  { id: '2', name: 'Project 2' }
];

app.locals.palettes = [
  { id: '1', name: 'Palette 1', color1: '#FFFFFF', color2: '#FFFFFF', color3: '#FFFFFF', color4: '#FFFFFF', color5: '#FFFFFF', projectID: '1' },
  { id: '2', name: 'Palette 2', color1: '#000000', color2: '#000000', color3: '#000000', color4: '#000000', color5: '#000000', projectID: '1' },
  { id: '3', name: 'Palette 3', color1: '#000000', color2: '#000000', color3: '#000000', color4: '#000000', color5: '#000000', projectID: '2' }
];

app.use(express.static(__dirname + '/public'));

app.get('/api/v1/projects', (request, response) => {
  return response.status(200).json(app.locals.projects);
});

app.get('/api/v1/projects/:id', (request, response) => {
  const { id } = request.params;
  const project = app.locals.projects.find(project => project.id === id);

  if(project) {
    return response.status(200).json(project);
  } else {
    return response.sendStatus(404);
  }
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
})
