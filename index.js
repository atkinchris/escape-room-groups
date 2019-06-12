const { knuthShuffle } = require('knuth-shuffle')
const excelToJson = require('convert-excel-to-json')

const MAX_IN_GROUP = 5
const WORKBOOK_NAME = 'Away Day.xlsx'
const SHEET_NAME = 'People'

const peopleRaw = excelToJson({
  sourceFile: WORKBOOK_NAME,
  header: { rows: 4 },
  sheets: [SHEET_NAME],
  columnToKey: {
    '*': '{{columnHeader}}',
  },
})[SHEET_NAME]

const people = peopleRaw
  .filter(person => person['Coming to breakout?'] === 'Yes')
  .map(person => ({
    ...person,
    Exclusions: person.Exclusions ? person.Exclusions.split(',').map(e => e.trim()) : [],
  }))

const groupNames = [
  'Facility X',
  'Identify',
  'Most Wanted',
  'Enchanted',
  'Reclassified Blue',
  'Reclassified Green',
  'Vacancy',
  'Captured',
]

const buildGroups = () => {
  const groups = groupNames.map(name => ({ name, members: [] }))
  knuthShuffle(people)

  people.forEach(person => {
    const groupsAreFull = groups.every(group => group.members.length >= MAX_IN_GROUP)

    if (groupsAreFull) {
      throw Error(`Could not sort ${person.Name} - groups are full`)
    }

    knuthShuffle(groups).sort((a, b) => a.members.length > b.members.length)
    const wasSortedIntoGroup = groups.some(group => {
      if (String(person[group.name] || '').startsWith('No') || group.members.length >= MAX_IN_GROUP) {
        return false
      }

      const hasClashes = group.members.some(member => {
        const memberExclusions = people.find(p => p.Name === member).Exclusions
        return memberExclusions.includes(person.Name) || person.Exclusions.includes(member)
      })

      if (hasClashes) {
        return false
      }

      group.members.push(person.Name)
      return true
    })

    if (!wasSortedIntoGroup) {
      throw Error(`Could not sort ${person.Name} - no suitable group`)
    }
  })

  return groups
}

let groups
let iteration = 0
const iterationLimit = 1000

while (groups === undefined && iteration < iterationLimit) {
  try {
    iteration += 1
    groups = buildGroups()
  } catch (err) {
    // console.log(err.message)
  }
}

if (!groups) {
  console.log('Could not generate groups')
} else {
  groups
    .sort((a, b) => a.name > b.name)
    .forEach(group => {
      console.log(group.name)
      group.members.forEach(member => console.log(`* ${member}`))
      console.log()
    })
}
