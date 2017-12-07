const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage', () => {
    return chai.request(server)
      .get('/')
      .then(response => {
        response.should.have.status(200);
        response.should.be.html;
        response.res.text.should.include('Palette Picker');
      })
      .catch(error => {
        throw error;
      });
  });

  it.skip('should return a 404 for a route that does not exist', () => {
    return chai.request(server)
      .get('/sad')
      .then(response => {
        response.should.have.status(404);
      })
      .catch(error => {
        throw error;
      });
  });

});

describe('API Routes', () => {

  before((done) => {
    database.migrate.latest()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  describe('GET /api/v1/projects', () => {
    it('should return all of the projects', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(1);
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('Holidaze');
        })
        .catch(error => {
          throw error;
        });
    });

    it.skip('should return a 404 for a route that does not exist', () => {
      return chai.request(server)
        .get('/api/v1/nope')
        .then(response => {
          response.should.have.status(404);
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('GET /api/v1/palettes', () => {
    it('should return all of the palettes', () => {
      return chai.request(server)
        .get('/api/v1/palettes')
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(2);
          response.body[0].should.have.property('name');
          response.body[1].should.have.property('name');
          response.body[0].name.should.equal('Beach');
          response.body[1].name.should.equal('Music');
          response.body[0].should.have.property('color1');
          response.body[1].should.have.property('color1');
          response.body[0].color1.should.equal('#123456');
          response.body[1].color1.should.equal('#000000');
          response.body[0].should.have.property('color2');
          response.body[1].should.have.property('color2');
          response.body[0].color2.should.equal('#789123');
          response.body[1].color2.should.equal('#FFFFFF');
          response.body[0].should.have.property('color3');
          response.body[1].should.have.property('color3');
          response.body[0].color3.should.equal('#456789');
          response.body[1].color3.should.equal('#123123');
          response.body[0].should.have.property('color4');
          response.body[1].should.have.property('color4');
          response.body[0].color4.should.equal('#ABCDEF');
          response.body[1].color4.should.equal('#999999');
          response.body[0].should.have.property('color5');
          response.body[1].should.have.property('color5');
          response.body[0].color5.should.equal('#0F0F0F');
          response.body[1].color5.should.equal('#987654');
          response.body[0].should.have.property('id');
          response.body[1].should.have.property('id');
          response.body[0].id.should.equal(1);
          response.body[1].id.should.equal(2);
          response.body[0].should.have.property('project_id');
          response.body[1].should.have.property('project_id');
          response.body[0].project_id.should.equal(1);
          response.body[1].project_id.should.equal(1);
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('GET /api/v1/projects/:projectID/palettes', () => {
    it('should return all of the palettes for a specific project', () => {
      return chai.request(server)
        .get('/api/v1/projects/1/palettes')
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(2);
          response.body[0].should.have.property('name');
          response.body[1].should.have.property('name');
          response.body[0].name.should.equal('Beach');
          response.body[1].name.should.equal('Music');
          response.body[0].should.have.property('color1');
          response.body[1].should.have.property('color1');
          response.body[0].color1.should.equal('#123456');
          response.body[1].color1.should.equal('#000000');
          response.body[0].should.have.property('color2');
          response.body[1].should.have.property('color2');
          response.body[0].color2.should.equal('#789123');
          response.body[1].color2.should.equal('#FFFFFF');
          response.body[0].should.have.property('color3');
          response.body[1].should.have.property('color3');
          response.body[0].color3.should.equal('#456789');
          response.body[1].color3.should.equal('#123123');
          response.body[0].should.have.property('color4');
          response.body[1].should.have.property('color4');
          response.body[0].color4.should.equal('#ABCDEF');
          response.body[1].color4.should.equal('#999999');
          response.body[0].should.have.property('color5');
          response.body[1].should.have.property('color5');
          response.body[0].color5.should.equal('#0F0F0F');
          response.body[1].color5.should.equal('#987654');
          response.body[0].should.have.property('id');
          response.body[1].should.have.property('id');
          response.body[0].id.should.equal(1);
          response.body[1].id.should.equal(2);
          response.body[0].should.have.property('project_id');
          response.body[1].should.have.property('project_id');
          response.body[0].project_id.should.equal(1);
          response.body[1].project_id.should.equal(1);
        })
        .catch(error => {
          throw error;
        });
    });

    it.skip('should return a 404 for a project that does not exist', (done) => {
      return chai.request(server)
        .get('/api/v1/projects/700/palettes')
        .then(response => {
          response.should.have.status(404);
          done();
        })
        .catch(error => {
          throw error;
        });
    });

  });

  describe('POST /api/v1/projects', () => {

    it('should be able to add a new project to the database', (done) => {
      chai.request(server)
        .post('/api/v1/projects')
        .send({
          id: 2,
          name: 'Onyx'
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('Onyx');
          response.body.should.have.property('id');
          response.body.id.should.equal(2);
          chai.request(server)
            .get('/api/v1/projects')
            .then(response => {
              response.body.should.be.a('array');
              response.body.length.should.equal(2);
              done();
            });
        })
        .catch(error => {
          throw error;
        });
    });

    it.skip('should not create a project with missing data', () => {
      return chai.request(server)
        .post('/api/v1/projects')
        .send({
          id: 4
        })
        .then(response => {
          response.should.have.status(422);
          response.body.error.should
            .equal('You are missing the name property.');
        })
        .catch(error => {
          throw error;
        });
    });

  });

  describe('POST /api/v1/projects/:projectID/palettes', () => {

    it('should be able to add a new palette to the database', (done) => {
      chai.request(server)
        .post('/api/v1/projects/1/palettes')
        .send({
          id: 3,
          name: 'Ocean',
          color1: '#246802',
          color2: '#346802',
          color3: '#446802',
          color4: '#546802',
          color5: '#646802'
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('name');
          response.body.name.should.equal('Ocean');
          response.body.should.have.property('id');
          response.body.id.should.equal(3);
          response.body.should.have.property('color1');
          response.body.color1.should.equal('#246802');
          response.body.should.have.property('color2');
          response.body.color2.should.equal('#346802');
          response.body.should.have.property('color3');
          response.body.color3.should.equal('#446802');
          response.body.should.have.property('color4');
          response.body.color4.should.equal('#546802');
          response.body.should.have.property('color5');
          response.body.color5.should.equal('#646802');
          chai.request(server)
            .get('/api/v1/projects/1/palettes')
            .then(response => {
              response.body.should.be.a('array');
              response.body.length.should.equal(3);
              done();
            });
        })
        .catch(error => {
          throw error;
        });
    });

    it.skip('should not create a palette with missing data', () => {
      return chai.request(server)
        .post('/api/v1/projects/1/palettes')
        .send({
          id: 4,
          name: 'cool palette',
          color1: '#FFFFFF',
          color2: '#FFFFFF',
          color3: '#FFFFFF',
          color4: '#FFFFFF'
        })
        .then(response => {
          response.should.have.status(422);
          response.body.error.should
            .equal('You are missing the color5 property');
        })
        .catch(error => {
          throw error;
        });
    });

  });

  describe('DELETE /api/v1/palettes/:id', () => {

    it('should delete a palette from the database', (done) => {
      chai.request(server)
        .delete('/api/v1/palettes/2')
        .then(response => {
          response.should.have.status(204);
          done();
        })
        .catch(error => {
          throw error;
        });
    });

    it.skip('should return 422 if item to delete does not exist', (done) => {
      chai.request(server)
        .delete('/api/v1/palettes/99')
        .then(response => {
          response.should.have.status(422);
          response.body.error.should.equal('Cannot find palette with ID 99.');
          done();
        })
        .catch(error => {
          throw error;
        });
    });

  });

});
