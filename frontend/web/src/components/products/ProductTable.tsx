'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { PaginationBar } from '@/components'
import { useTheme } from 'next-themes'
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
    PaginationState,
    Updater,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowClick: (row: TData) => void
    paginationState: PaginationState
    setPaginationState: (updater: Updater<PaginationState>) => void
}

const ProductTable = <TData, TValue>({ columns, data, onRowClick, paginationState, setPaginationState }: DataTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const { theme } = useTheme();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPaginationState,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: paginationState
        },
    });

    const handleReset = () => {
        table.getColumn('productName')?.setFilterValue('')
    }

    return (
        <div>
            <div className='h-[760px] bg-table py-2 rounded-3xl mt-2 flex flex-col items-end overflow-y-auto'>
                <div className="w-full flex justify-end mb-1">
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="w-[150px] flex justify-between items-center mr-3 border-none rounded-full bg-background">
                                <Button className='w-full h-full flex justify-between items-center bg-background rounded-full hover:bg-background text-primary'>
                                    Filter
                                    <div className='flex justify-center items-center'>
                                        {theme === 'dark' ? (
                                            <Image src='/images/arrow-W.png' alt='delete' width={13} height={13} />
                                        ) : (
                                            <Image src='/images/arrow.png' alt='delete' width={13} height={13} />
                                        )}
                                    </div>
                                </Button>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) => column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Search Bar */}
                    <form
                        onReset={handleReset}
                        className='w-[270px] bg-background flex justify-between items-center mr-2 rounded-full'
                    >
                        <input
                            id='searchBar'
                            name='searchBar'
                            placeholder="Search..."
                            value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
                            onChange={(event) =>
                                table.getColumn('productName')?.setFilterValue(event.target.value)
                            }
                            className="w-full p-3 max-w-sm text-sm bg-transparent focus:outline-none"
                        />
                        <button type='reset' className='w-[28px] h-[28px] p-2 mr-4 flex justify-center items-center rounded-full focus:outline-none hover:bg-table cursor-pointer'>
                            {theme === 'dark' ? (
                                <Image src='/images/cross-W.png' alt='delete' width={25} height={25} />
                            ) : (
                                <Image src='/images/cross.png' alt='delete' width={25} height={25} />
                            )}
                        </button>
                    </form>
                </div>
                <Table className='overflow-hidden'>
                    {/* Columns */}
                    <TableHeader>
                        {table.getHeaderGroups()?.map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='sticky top-0 left-0 bg-table z-10 hover:bg-transparent border-b-2 border-muted/50'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-center bg-table">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {/* Rows */}
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} onClick={() => onRowClick(row.original)}>
                                {row.getVisibleCells().map(cell => (
                                    <TableHead key={cell.id} className="h-[60px] text-center py-1 text-primary border-b border-muted">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationBar table={table} />
        </div>
    )
}

export default ProductTable;