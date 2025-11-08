export type Person = {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  status: 'relationship' | 'complicated' | 'single'
  createdAt: Date
}

const range = (len: number) => {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const r = () => Math.floor(Math.random() * 10000)

const newPerson = (index: number): Person => {
  return {
    id: index + 1,
    firstName: 'first' + r(),
    lastName: 'last' + r(),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 1000),
    progress: Math.floor(Math.random() * 100),
    createdAt: new Date(2016, 0, 1),
    status: ['relationship', 'complicated', 'single'][Math.floor(Math.random() * 3)] as
      | 'relationship'
      | 'complicated'
      | 'single'
  }
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!
    return range(len).map((d): Person => {
      return {
        ...newPerson(d)
      }
    })
  }

  return makeDataLevel()
}
