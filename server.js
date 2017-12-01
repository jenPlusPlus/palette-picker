// import express and set to variable
const express = require('express');
// initialize instance of express server & set to variable
const app = express();
// import body-parser and set to variable
const bodyParser = require('body-parser');

// set the server port to the PORT environment variable or default to 3000
app.set('port', process.env.PORT || 3000);

// apply .json bodyParser method to app (server)
app.use(bodyParser.json());
// apply .urlencoded bodyParser method to app (server)
app.use(bodyParser.urlencoded({ extended: true }));

// set environment variable to environment defined by NODE_ENV or set to development
const environment = process.env.NODE_ENV || 'development';
// import knexfile and set configuration variable to hold environment data for environment defined by [environment]
const configuration = require('./knexfile')[environment];
// import knex and configure database with info from (configuration);
// this ensures the db is set up with the settings for the specified environment
const database = require('knex')(configuration);

// set title of app (server) in app.locals
app.locals.title = 'Palette Picker';

// serve/return index.html from /public folder for url '/'
app.use(express.static(__dirname + '/public'));

// make GET HTTP request to database at '/api/v1/projects'
app.get('/api/v1/projects', (request, response) => {
  // retreive/query all projects from database
  database('projects').select()
    // if the request doesn't fail
    .then(projects => {
      // if you get projects back, send back a 200 response and a json object of projects
      return response.status(200).json(projects);
    })
    // if you get an error, send back a 500 response and the error text in form of json object
    .catch(error => {
      return response.status(500).json({ error });
    });
});

// make a GET HTTP request to database at /api/v1/projects/:projectID
app.get('/api/v1/projects/:projectID', (request, response) => {
  // retrieve/query all projects that have the id that matches :projectID in the URL
  database('projects').where('id', request.params.projectID).select()
  // if the request doesn't fail
  .then(projects => {
    // if projects is not an empty array (project was found)
    if(projects.length) {
      // send back a 200 response and the projects
      return response.status(200).json(projects);
      // if projects is an empty array (project was not found)
    } else {
      // send back 404 response and error text in form of a json object
      return response.status(404).json({
        error: `Could not find project with ID of ${request.params.projectID}`
      })
    }
  })
  // if something goes wrong with the request
  .catch(error => {
    // send back a 500 status and the error text in the form of a json object
    return response.status(500).json({ error });
  })
});

// make a GET HTTP request to the database at /api/v1/palettes/:paletteID
app.get('/api/v1/palettes/:paletteID', (request, response) => {
  // get palette ID from URL and assign it to variable paletteID
  const paletteID = request.params.paletteID;
  // retrieve/query database for palettes with the specified ID
  database('palettes').where('id', request.params.paletteID).select()
  // if the request doesn't fail
  .then(palette => {
    // if palette is not an empty array (palette was found)
    if (palette.length) {
      // send back a 200 response and the palette in the form of a json object
      return response.status(200).json(palette);
      // if palette is an empty array (palette was not found)
    } else {
      // send back a 404 response with error text in the form of a json object
      return response.status(404).json({ error: `Cannot find palette with ID ${paletteID}.` })
    }
  })
  // if something goes wrong with the request
  .catch(error => {
    // send back a 500 response with error text in the form of a json object
    return response.status(500).json({ error })
  });
});

// this function is unnecessary for this project, but i'm keeping it for future functionality
// make a GET HTTP request to the database at '/api/v1/palettes'
app.get('/api/v1/palettes', (request, response) => {
  // retrieve/query database for all palettes
  database('palettes').select()
  // if the request doesn't fail
    .then(palettes => {
      // return a 200 response with the palettes in the form of a json object
      return response.status(200).json(palettes);
    })
    // if something goes wrong with the request
    .catch(error => {
      // send back a 500 response with error text in the form of a json object
      return response.status(500).json({ error });
    });
});

// make a GET HTTP request to the database at '/api/v1/palettes'
app.get('/api/v1/projects/:projectID/palettes', (request, response) => {
  // retrieve/query database for all palettes that contain the project_id that matches the projectID from the URL
  database('palettes').where('project_id', request.params.projectID).select()
  // if the request doesn't fail
  .then(palettes => {
    // if palettes is not an empty array (palettes were found)
    if(palettes.length) {
      // send back a 200 response and the palettes in the form of a json object
      return response.status(200).json(palettes);
      // if palettes is an empty array (no palettes were found)
    } else {
      // send back a 404 error and error text in the form of a json object
      return response.status(404).json({
        error: `Could not find palettes for project with ID of ${request.params.projectID}`
      })
    }
  })
  // if something goes wrong with the request
  .catch(error => {
    // send back a 500 error with message text in the form of a json object
    return response.status(500).json({ error });
  })
});

// make a POST HTTP request to /api/v1/projects
app.post('/api/v1/projects', (request, response) => {
  // get the body of the request and set it to variable project
  const project = request.body;
  // loop through array of required parameters
  for (let requiredParameter of ['name']) {
    // if the required parameter is not found in request
    if(!project[requiredParameter]) {
      // send back a 422 response with error text in the form of a json object
      return response.status(422).json({
        error: `You are missing the ${requiredParameter} property.`
      });
    }
  }
  // add a new project to the projects table and give back the id & name
  database('projects').insert(project, ['id', 'name'])
  // if the request doesn't fail
  .then(project => {
    // send back a 201 response and the project id & name in the form of a json object
    return response.status(201).json({ id: project[0].id, name: project[0].name })
  })
  // if something goes wrong with the request
  .catch(error => {
    // send back a 500 error with message text in the form of a json object
    return response.status(500).json({ error });
  })
});

// make a POST HTTP request to the database at /api/v1/projects/:projectID/palettes
app.post('/api/v1/projects/:projectID/palettes', (request, response) => {
  // get the body of the request and save it to variable palette
  let palette = request.body;
  // get projectID from URL and save it to variable projectID
  const projectID = request.params.projectID;

  // loop through an array of required parameters
  for (let requiredParameter of ['name', 'color1', 'color2', 'color3', 'color4', 'color5']){
    // if the required parameter is missing from the request
    if(!palette[requiredParameter]) {
      // send back a 422 response with error message text in form of a json object
      return response.status(422).json({
        error: `You are missing the ${requiredParameter} property`
      });
    }
  }

  // set variable palette to have the original palette object, with a project_id property added to it
  palette = Object.assign({}, palette, {project_id: projectID});
  // add a new palette to the palettes table and give back the id, name, & all 5 colors
  database('palettes').insert(palette, ['id', 'name', 'color1', 'color2', 'color3', 'color4', 'color5'])
  // if the response doesn't fail
  .then(palette => {
    // send back a 201 status and the palette data in the form of a json object
    return response.status(201).json( {
      id: palette[0].id,
      name: palette[0].name,
      color1: palette[0].color1,
      color2: palette[0].color2,
      color3: palette[0].color3,
      color4: palette[0].color4,
      color5: palette[0].color5
     })
  })
  // if the request fails
  .catch(error => {
    // send back a 500 response with the error message text in the form of a json object
    return response.status(500).json( { error });
  })
});

// make DELETE HTTP request to /api/v1/palettes/:paletteID
app.delete('/api/v1/palettes/:paletteID', (request, response) => {
  // get paletteID from URL and save to variable paletteID
  const paletteID = request.params.paletteID;
  // remove from database palette that has the paletteID specified in the URL
  database('palettes').where('id', request.params.paletteID).del()
  // if the request does not fail
  .then(palette => {
    // if palette is not undefined (palette found)
    if (palette) {
      // send back a 204 response status
      return response.sendStatus(204)
      // if palette is undefined (no palette found)
    } else {
      // send back 422 response with error message text in the form of a json object
      return response.status(422).json({ error: `Cannot find palette with ID ${paletteID}.` })
    }
  })
  // if the request fails
  .catch(error => {
    // send back a 500 response with error message text in the form of a json object
    return response.status(500).json({ error })
  });
});

// app (server) gets the port that was set previously and waits at that port for requests
app.listen(app.get('port'), () => {
  // text confirming the server is listening is written to the default output
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
})
