import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import ProjectRowActionsDropdown from "./project-row-actions-dropdown";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const statusColors = {
  "for review": "blue",
  cancelled: "red",
  completed: "green",
  inProgress: "blue",
  pending: "amber",
  shipping: "amber",
};

export const projectsColumns = [
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => {
      const name = row.original.name;

      return <span>{name}</span>;
    },
  },
  {
    accessorKey: "dateFinished",
    header: "Date Finished",
    cell: ({ row }) => {
      const date = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(row.original.dateFinished);

      return <span>{date}</span>;
    },
  },
  {
    accessorKey: "worker",
    header: "Worker",
    cell: ({ row }) => {
      const name = row.original.worker.name;

      return name;
    },
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => {
      const service = row.original.typeOfService;

      return <span>{service}</span>;
    },
  },
  {
    accessorKey: "status",
    header: <div className="flex justify-center">Status</div>,
    cell: ({ row }) => (
      <div
        className={cn(
          "rounded-full flex justify-center items-center p-1 capitalize min-w-[75px]",
          `text-${statusColors[row.original.status]}-500`,
          `bg-${statusColors[row.original.status]}-50`
        )}
      >
        {row.original.status}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const project = row.original; // TODO use id for navigation

      return <ProjectRowActionsDropdown project={project} />;
    },
  },
];

export function ProjectsTable({ data, columns, filter = [], history }) {
  const [columnFilters, setColumnFilters] = useState(filter);
  const { data: user } = useQuery(
    ["user"],
    async () => {
      const response = await axios.get("/api/auth/me");

      return response.data;
    },
    {
      onSuccess() {
        if (user.role === "contractor") {
          table.getColumn("service").toggleVisibility(false);
        }
      },
    }
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  useEffect(() => {
    filter.map((column) => table.getColumn(column).toggleVisibility(false));
  }, [filter, table, user]);

  return (
    <Card className="w-[850px]">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
