import { Row, Table } from '@tanstack/react-table'

let _table: Table<any> | undefined
let _onSelectRows: ((rows: any[]) => void) | undefined = undefined
let _onContextMenu: ((rows: any[]) => void) | undefined = undefined
let lastIndex: number | undefined = undefined

function findIndex(rows: Row<any>[], row: Row<any>) {
  return rows.findIndex(({ id }) => id === row.id)
}

function select(row: Row<any>, e: React.MouseEvent<HTMLTableRowElement, MouseEvent>): Row<any>[] {
  if (!_table) return []
  const sortedRows = _table.getSortedRowModel().rows
  const selectedRows = _table.getSelectedRowModel().rows
  let indexRows = selectedRows
    .map((row) => ({ index: findIndex(sortedRows, row), row }))
    .sort((a, b) => a.index - b.index)
  const prevIndexRows = [...indexRows]
  const currentIndex = findIndex(sortedRows, row)

  if (e.ctrlKey) {
    if (row.getIsSelected()) {
      indexRows = indexRows.filter(({ index }) => index !== currentIndex)
      lastIndex = indexRows[indexRows.length - 1]?.index
    } else {
      indexRows.push({ index: currentIndex, row })
      lastIndex = currentIndex
    }
  } else if (e.shiftKey && lastIndex !== undefined) {
    const [min, max] = [lastIndex, currentIndex].sort((a, b) => a - b)
    indexRows = new Array(max - min + 1).fill(0).map((_, index) => {
      return { row: sortedRows[index + min], index: index + min }
    })
  } else {
    indexRows = [{ index: currentIndex, row }]
    lastIndex = currentIndex
  }

  const rows = indexRows.map(({ row }) => row)
  const indexes = indexRows.map(({ index }) => index)
  prevIndexRows.forEach(({ index, row }) => row.toggleSelected(indexes.includes(index)))
  rows.forEach((row) => row.toggleSelected(true))

  _onSelectRows?.(rows.map((row) => row.original))
  return rows
}

function selectAll() {
  if (!_table) return
  const rows: Row<any>[] = []
  _table.setRowSelection(
    _table.getRowModel().rows.reduce((map, row, index) => {
      map[index] = true
      rows.push(row)
      return map
    }, {})
  )
  _onSelectRows?.(rows.map((row) => row.original))
}

function invertSelection() {
  if (!_table) return
  const rows: Row<any>[] = []
  _table.setRowSelection(
    _table.getRowModel().rows.reduce((map, row, index) => {
      map[index] = !row.getIsSelected()
      if (map[index]) rows.push(row)
      return map
    }, {})
  )
  _onSelectRows?.(rows.map((row) => row.original))
}

function contextMenu(row: Row<any>, e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) {
  const rows = row.getIsSelected() ? _table!.getSelectedRowModel().rows : select(row, e)
  _onContextMenu?.(rows.map((row) => row.original))
}

function clear() {
  lastIndex = undefined
  _table?.getSelectedRowModel().rows.forEach((row) => row.toggleSelected(false))
  _onSelectRows?.([])
}

export default {
  init(
    table: Table<any>,
    onSelectRows?: (rows: any[]) => void,
    onContextMenu?: (rows: any[]) => void
  ) {
    _table = table
    _onSelectRows = onSelectRows
    _onContextMenu = onContextMenu
  },
  select,
  contextMenu,
  selectAll,
  invertSelection,
  clear
}
