const { knuthShuffle } = require('knuth-shuffle')

const peopleRaw = require('./people.json')

const MAX_IN_GROUP = 5

const people = peopleRaw
  .filter(person => person.Reserve !== 'Yes')
  .map(person => ({
    ...person,
    Exclusions: person.Exclusions ? person.Exclusions.split(',') : [],
  }))

const personMetaKeys = ['Name', 'Reserve', 'Exclusions']
const groupNames = Object.keys(people[0]).filter(key => !personMetaKeys.includes(key))

const buildGroups = () => {
  const groups = groupNames.map(name => ({ name, members: [] }))
  knuthShuffle(people)

  people.forEach(person => {
    const groupsAreFull = groups.every(group => group.members.length >= MAX_IN_GROUP)

    if (groupsAreFull) {
      throw Error(`Could not sort ${person.Name} - groups are full`)
    }

    knuthShuffle(groups)
    const wasSortedIntoGroup = groups.some(group => {
      if (person[group.name].startsWith('No') || group.members.length >= MAX_IN_GROUP) {
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
  groups.forEach(group => {
    console.log(group.name)
    group.members.forEach(member => console.log(`* ${member}`))
    console.log()
  })
}
