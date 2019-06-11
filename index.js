const { knuthShuffle } = require('knuth-shuffle')

const people = require('./people.json')

const groupNames = Object.keys(people[0]).filter(key => key !== 'Name')

const buildGroups = () => {
  const groups = groupNames.map(name => ({ name, members: [] }))
  knuthShuffle(people)
  knuthShuffle(groups)

  people.forEach(person => {
    const groupsAreFull = groups.every(group => group.members.length >= 5)

    if (groupsAreFull) {
      throw Error(`Could not sort ${person.Name} - groups are full`)
    }

    const wasSortedIntoGroup = groups.some(group => {
      if (person[group.name].startsWith('Yes') && group.members.length < 5) {
        group.members.push(person.Name)
        return true
      }

      return false
    })

    if (!wasSortedIntoGroup) {
      throw Error(`Could not sort ${person.Name} - no suitable group`)
    }
  })

  return groups
}

let groups
let iteration = 0
const iterationLimit = 10

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
