
exports.seed = function(knex, Promise) {
  return knex('palettes').del() 
    .then(() => knex('projects').del())
    .then(() => {
      return Promise.all([
        knex('projects').insert({
          id: 1,
          name: 'Holidaze'
        }, 'id')
        .then(project => {
          return knex('palettes').insert([
            {
              id: 1,
              name: 'Beach',
              color1: '#123456',
              color2: '#789123',
              color3: '#456789',
              color4: '#ABCDEF',
              color5: '#0F0F0F',
              project_id: project[0]
            },
            {
              id: 2,
              name: 'Music',
              color1: '#000000',
              color2: '#FFFFFF',
              color3: '#123123',
              color4: '#999999',
              color5: '#987654',
              project_id: project[0]
            }
          ])
        })
        .then(() => console.log('seeding complete!'))
        .catch(error => console.log({ error }))
      ]);
    })
    .catch(error => console.log({ error }));
};
