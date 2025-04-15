// Test script to check date parsing and day of week calculation

// Get the date from command line argument or use today's date
const dateString = process.argv[2] || new Date().toISOString().split('T')[0];

console.log(`Testing date parsing for: ${dateString}`);

// Parse the date in different ways
const date1 = new Date(dateString);
const date2 = new Date(`${dateString}T00:00:00`);
const date3 = new Date(`${dateString}T00:00:00Z`);

// Create date parts for manual construction
const [year, month, day] = dateString.split('-').map(Number);
const date4 = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

console.log('\nDate objects:');
console.log(`1. new Date(dateString): ${date1.toString()}`);
console.log(`2. new Date(dateString + T00:00:00): ${date2.toString()}`);
console.log(`3. new Date(dateString + T00:00:00Z): ${date3.toString()}`);
console.log(`4. new Date(year, month-1, day): ${date4.toString()}`);

console.log('\nDay of week (0=Sunday, 1=Monday, etc.):');
console.log(`1. date1.getDay(): ${date1.getDay()}`);
console.log(`2. date2.getDay(): ${date2.getDay()}`);
console.log(`3. date3.getDay(): ${date3.getDay()}`);
console.log(`4. date4.getDay(): ${date4.getDay()}`);

console.log('\nISO strings:');
console.log(`1. date1.toISOString(): ${date1.toISOString()}`);
console.log(`2. date2.toISOString(): ${date2.toISOString()}`);
console.log(`3. date3.toISOString(): ${date3.toISOString()}`);
console.log(`4. date4.toISOString(): ${date4.toISOString()}`);

// Test with a specific known date (e.g., 2023-04-17 was a Monday)
const knownMonday = '2023-04-17';
const mondayDate = new Date(knownMonday);
console.log(`\nKnown Monday (${knownMonday}): day of week = ${mondayDate.getDay()}`);

// Current date for reference
const now = new Date();
console.log(`\nCurrent date: ${now.toString()}`);
console.log(`Current day of week: ${now.getDay()}`);

// Test with the date format used in the controller
function testDateWithFormat(dateStr) {
  console.log(`\nTesting with date: ${dateStr}`);
  const date = new Date(dateStr);
  console.log(`Parsed date: ${date.toString()}`);
  console.log(`Day of week: ${date.getDay()}`);
  console.log(`ISO string: ${date.toISOString()}`);
}

// Test with a few different date formats
testDateWithFormat('2023-04-17'); // Monday
testDateWithFormat('2023-04-18'); // Tuesday
testDateWithFormat('2023-04-19'); // Wednesday
testDateWithFormat('2023-04-20'); // Thursday
testDateWithFormat('2023-04-21'); // Friday
testDateWithFormat('2023-04-22'); // Saturday
testDateWithFormat('2023-04-23'); // Sunday
