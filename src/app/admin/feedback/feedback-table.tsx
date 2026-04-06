'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

export type FeedbackRow = {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  user_email: string | null;
};

type Props = {
  rows: FeedbackRow[];
  page: number;
  pageSize: number;
  total: number;
};

const columns: ColumnDef<FeedbackRow>[] = [
  {
    accessorKey: 'created_at',
    header: 'Submitted',
    cell: ({ getValue }) => <span>{formatRelativeTime(String(getValue()))}</span>,
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'body',
    header: 'Body',
    cell: ({ getValue }) => <span>{truncate(String(getValue()), 200)}</span>,
  },
  {
    accessorKey: 'user_email',
    header: 'User',
    cell: ({ getValue }) => {
      const value = getValue();
      return <span>{value ? String(value) : '—'}</span>;
    },
  },
];

export function FeedbackTable({ rows, page, pageSize, total }: Props) {
  const data = useMemo(() => rows, [rows]);
  const sortingState: SortingState = [];

  const table = useReactTable({
    data,
    columns,
    state: { sorting: sortingState },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className='flex flex-col gap-4'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Page {page} of {totalPages} · {total} total
        </p>
        <div className='flex gap-2'>
          <Button asChild variant='secondary' size='sm' disabled={!hasPrev}>
            <Link
              href={{ pathname: '/admin/feedback', query: { page: Math.max(1, page - 1) } }}
              aria-disabled={!hasPrev}
            >
              Previous
            </Link>
          </Button>
          <Button asChild variant='secondary' size='sm' disabled={!hasNext}>
            <Link
              href={{ pathname: '/admin/feedback', query: { page: Math.min(totalPages, page + 1) } }}
              aria-disabled={!hasNext}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}…`;
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}
