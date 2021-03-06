const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const requireHTTPS = (request, response, next) => {
  if (request.header('x-forwarded-proto') !== 'https') {
    return response.redirect(`https://${request.header('host')}${request.url}`);
  }
  next();
};

if (process.env.NODE_ENV === 'production') { app.use(requireHTTPS); }

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.locals.title = 'Palette Picker';


app.use(express.static(__dirname + '/public'));

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then(projects => {
      return response.status(200).json(projects);
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

// unnecessary?
app.get('/api/v1/projects/:projectID', (request, response) => {
  database('projects').where('id', request.params.projectID).select()
    .then(projects => {
      if (projects.length) {
        return response.status(200).json(projects);
      } else {
        return response.status(404).json({
          error: `Could not find project with ID of ${request.params.projectID}`
        });
      }
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes/:paletteID', (request, response) => {
  const paletteID = request.params.paletteID;

  database('palettes').where('id', request.params.paletteID).select()
    .then(palette => {
      if (palette.length) {
        return response.status(200).json(palette);
      } else {
        return response.status(404).json(
          { error: `Cannot find palette with ID ${paletteID}.` });
      }
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

// unecessary ??
app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then(palettes => {
      return response.status(200).json(palettes);
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.get('/api/v1/projects/:projectID/palettes', (request, response) => {
  database('palettes').where('project_id', request.params.projectID).select()
    .then(palettes => {
      if (palettes.length) {
        return response.status(200).json(palettes);
      } else {
        return response.status(404).json({
          error: `Could not find palettes for project with ID of
          ${request.params.projectID}`
        });
      }
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.post('/api/v1/projects', (request, response) => {
  const project = request.body;
  for (var requiredParameter of ['name']) {
    if (!project[requiredParameter]) {
      return response.status(422).json({
        error: `You are missing the ${requiredParameter} property.`
      });
    }
  }

  database('projects').insert(project, ['id', 'name'])
    .then(project => {
      return response.status(201).json(
        { id: project[0].id,
          name: project[0].name });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.post('/api/v1/projects/:projectID/palettes', (request, response) => {
  var palette = request.body;
  const projectID = request.params.projectID;

  for (var requiredParameter of ['name',
    'color1',
    'color2',
    'color3',
    'color4',
    'color5']){
    if (!palette[requiredParameter]) {
      return response.status(422).json({
        error: `You are missing the ${requiredParameter} property`
      });
    }
  }

  palette = Object.assign({}, palette, {project_id: projectID});

  database('palettes').insert(palette, ['id',
    'name',
    'color1',
    'color2',
    'color3',
    'color4',
    'color5'])
    .then(palette => {
      return response.status(201).json( {
        id: palette[0].id,
        name: palette[0].name,
        color1: palette[0].color1,
        color2: palette[0].color2,
        color3: palette[0].color3,
        color4: palette[0].color4,
        color5: palette[0].color5
      });
    })
    .catch(error => {
      return response.status(500).json( { error });
    });
});

app.delete('/api/v1/palettes/:paletteID', (request, response) => {
  const paletteID = request.params.paletteID;
  database('palettes').where('id', request.params.paletteID).del()
    .then(palette => {
      if (palette) {
        return response.sendStatus(204);
      } else {
        return response.status(422).json(
          { error: `Cannot find palette with ID ${paletteID}.` });
      }
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
