// Updated default state with entities
const defaultState = {
  ...previousState,
  entities: {}, // add your entities here
};

// Update the set function to use the spread operator and merge flag
const setData = (data) => {
  return set(ref(database, 'your/path'), {
    ...data,
    ...defaultState,
    merge: true, // use merge flag
  });
};

// Add entities to RTDB sync
const syncEntities = (entities) => {
  sync(ref(database, 'your/path/to/entities'), entities);
};

// Your existing code follows...