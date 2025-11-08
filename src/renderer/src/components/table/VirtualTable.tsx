import { memo, useEffect, useRef, useState } from 'react'
import { Empty } from 'antd'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable
} from '@tanstack/react-table'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import SortingHandler from './SortingHandler'
import rowSelector from './rowSelector'

interface VirtualTableProps {
  columns: any[]
  data: any[]
  onSelectRows?: (rows: any[]) => void
  onContextMenu?: (rows: any[]) => void
}

function VirtualTable({
  columns,
  data,
  onSelectRows,
  onContextMenu
}: VirtualTableProps): React.JSX.Element {
  // The virtualizer will need a reference to the scrollable container element
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    },
    onSortingChange: setSorting,
    enableRowSelection: true
    // debugTable: true
  })

  rowSelector.init(table, onSelectRows, onContextMenu)

  useEffect(() => {
    rowSelector.clear()
  }, [data, sorting])

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className={`${header.id}-column`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortingHandler sort={header.column.getIsSorted()} />
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
      </table>
      <div className="table-container" ref={tableContainerRef}>
        {data.length > 0 ? (
          <table style={{ display: 'grid' }}>
            <TableBody
              table={table}
              tableContainerRef={tableContainerRef as React.RefObject<HTMLDivElement>}
            />
          </table>
        ) : (
          <div className="empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="task-list-empty">
                  <>
                    {/* <div>{Math.random()}</div> */}
                    <span>拖放图片到这里</span>
                  </>
                </div>
              }
            ></Empty>
          </div>
        )}
      </div>
    </>
  )
}

interface TableBodyProps {
  table: Table<any>
  tableContainerRef: React.RefObject<HTMLDivElement>
}

function TableBody({ table, tableContainerRef }: TableBodyProps) {
  const { rows } = table.getRowModel()

  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 81, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    // measureElement:
    //   typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
    //     ? (element) => element?.getBoundingClientRect().height
    //     : undefined,
    overscan: 5
  })

  return (
    <tbody
      style={{
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
        position: 'relative' //needed for absolute positioning of rows
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<any>
        return (
          <TableBodyRow
            key={row.id}
            row={row}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
            onClick={(e) => rowSelector.select(row, e)}
            onContextMenu={(e) => rowSelector.contextMenu(row, e)}
            className={row.getIsSelected() ? 'selected' : ''}
          />
        )
      })}
    </tbody>
  )
}

interface TableBodyRowProps extends React.TableHTMLAttributes<HTMLTableRowElement> {
  row: Row<any>
  virtualRow: VirtualItem
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

function TableBodyRow({ row, virtualRow, rowVirtualizer, ...props }: TableBodyRowProps) {
  return (
    <tr
      data-index={virtualRow.index} //needed for dynamic row height measurement
      ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
      key={row.id}
      style={{
        position: 'absolute',
        transform: `translateY(${virtualRow.start}px)` //this should always be a `style` as it changes on scroll
      }}
      {...props}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td key={cell.id} className={cell.column.id + '-column'}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}

export default memo(VirtualTable)
