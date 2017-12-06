
exports.seed = function(knex, Promise) {
  return knex('palettes').del() // Deletes ALL existing palettes
    .then(() => knex('projects').del()) // Deletes ALL existing papers
    .then(() => {
      return Promise.all([
        knex('projects').insert({
          name: 'Project 1'
        }, 'id')
          .then(project => {
            return knex('palettes').insert([
              {
                name: 'Palette 1',
                color1: '#FFFFFF',
                color2: '#FFFFFF',
                color3: '#FFFFFF',
                color4: '#FFFFFF',
                color5: '#FFFFFF',
                project_id: project[0]
              },
              {
                name: 'Palette 2',
                color1: '#000000',
                color2: '#000000',
                color3: '#000000',
                color4: '#000000',
                color5: '#000000',
                project_id: project[0]
              }
            ]);
          })
          .catch(error => console.log({ error }))
      ]); 
    })
    .catch(error => console.log({ error }));
};
