/**
 * Some random AI generated lodash code.
 */

// 1. Create an array of objects and use _.map to transform it
const users = [
  { user: 'barney', age: 36, active: true },
  { user: 'fred', age: 40, active: false },
  { user: 'pebbles', age: 1, active: true },
];

const userNames = _.map(users, 'user');
console.log('User Names:', userNames);

// 2. Filter users who are active
const activeUsers = _.filter(users, { active: true });
console.log('Active Users:', activeUsers);

// 3. Find the first user who is active
const firstActiveUser = _.find(users, { active: true });
console.log('First Active User:', firstActiveUser);

// 4. Sort users by age
const sortedUsers = _.sortBy(users, 'age');
console.log('Sorted Users by Age:', sortedUsers);

// 5. Group users by active status
const groupedUsers = _.groupBy(users, 'active');
console.log('Grouped Users by Active Status:', groupedUsers);

// 6. Get unique elements from an array
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = _.uniq(numbers);
console.log('Unique Numbers:', uniqueNumbers);

// 7. Merge two objects
const object1 = { name: 'barney', age: 36 };
const object2 = { active: true, location: 'USA' };
const mergedObject = _.merge(object1, object2);
console.log('Merged Object:', mergedObject);

// 8. Debounce a function to limit how often it can be called
const logMessage = _.debounce(() => {
  console.log('This message will be logged after 500ms');
}, 500);

logMessage();
logMessage();
logMessage(); // Only the last call will be executed after 500ms

// 9. Random number between 0 and 100
const randomNumber = _.random(0, 100);
console.log('Random Number:', randomNumber);

// 10. Check if a value is a number
const isNumber = _.isNumber(42);
console.log('Is 42 a number?', isNumber);

// 11. Deep clone an object
const deepClonedObject = _.cloneDeep(object1);
console.log('Deep Cloned Object:', deepClonedObject);

// 12. Pick specific properties from an object
const pickedProperties = _.pick(object1, ['name', 'age']);
console.log('Picked Properties:', pickedProperties);
