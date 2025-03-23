"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ColumnsIcon,
  GripVerticalIcon,
  MoreVerticalIcon,
  PlusIcon,
  Wallet,
  Zap,
  MessageSquare,
  Clock,
  Brain,
} from "lucide-react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const agentSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  skills: z.string(),
  balance: z.string(),
  lastActive: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof agentSchema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Agent Name",
    cell: ({ row }) => {
      return <AgentCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="w-[120px] truncate">
        <Badge
          variant="outline"
          className="px-1.5 text-muted-foreground whitespace-nowrap max-w-full overflow-hidden text-ellipsis"
        >
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground whitespace-nowrap [&_svg]:size-3">
        {row.original.status === "Active" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400 flex-shrink-0" />
        ) : (
          <Brain className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
        )}
        <span className="truncate">{row.original.status}</span>
      </Badge>
    ),
  },
  {
    accessorKey: "skills",
    header: () => (
      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
        <Zap className="h-4 w-4 flex-shrink-0" /> Skills
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.skills}</div>,
  },
  {
    accessorKey: "balance",
    header: () => (
      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
        <Wallet className="h-4 w-4 flex-shrink-0" /> Balance
      </div>
    ),
    cell: ({ row }) => <div className="text-center font-mono">{row.original.balance}</div>,
  },
  {
    accessorKey: "lastActive",
    header: () => (
      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
        <Clock className="h-4 w-4 flex-shrink-0" /> Last Active
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.lastActive}</div>,
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat with Agent
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Zap className="mr-2 h-4 w-4" />
            Add Skills
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Wallet className="mr-2 h-4 w-4" />
            Manage Wallet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Brain className="mr-2 h-4 w-4" />
            Train Agent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof agentSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

export function MyAgentsTable({
  data: initialData,
}: {
  data: z.infer<typeof agentSchema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const sortableId = React.useId()
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="all-agents" className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="all-agents">
          <SelectTrigger className="@4xl/main:hidden flex w-fit" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-agents">All Agents</SelectItem>
            <SelectItem value="active">Active Agents</SelectItem>
            <SelectItem value="training">In Training</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="all-agents">All Agents</TabsTrigger>
          <TabsTrigger value="active" className="gap-1">
            Active{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              5
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1">
            In Training{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              2
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">Create Agent</span>
          </Button>
        </div>
      </div>
      <TabsContent value="all-agents" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No agents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} agent(s)
            selected.
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat with Selected</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              <span>Add Skills</span>
            </Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="active" className="flex flex-col px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {data
                .filter((agent) => agent.status === "Active")
                .map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>{agent.header}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {agent.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.skills}</TableCell>
                    <TableCell className="text-center font-mono">{agent.balance}</TableCell>
                    <TableCell className="text-center">{agent.lastActive}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                            size="icon"
                          >
                            <MoreVerticalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat with Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Zap className="mr-2 h-4 w-4" />
                            Add Skills
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wallet className="mr-2 h-4 w-4" />
                            Manage Wallet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Brain className="mr-2 h-4 w-4" />
                            Train Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="training" className="flex flex-col px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {data
                .filter((agent) => agent.status === "Training")
                .map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>{agent.header}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {agent.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                        <Brain className="text-blue-500 dark:text-blue-400" />
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.skills}</TableCell>
                    <TableCell className="text-center font-mono">{agent.balance}</TableCell>
                    <TableCell className="text-center">{agent.lastActive}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                            size="icon"
                          >
                            <MoreVerticalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Brain className="mr-2 h-4 w-4" />
                            View Training Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Zap className="mr-2 h-4 w-4" />
                            Add Skills
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wallet className="mr-2 h-4 w-4" />
                            Manage Wallet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="favorites" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>You haven't marked any agents as favorites yet.</p>
            <Button variant="outline" className="mt-4">
              Add Favorites
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function AgentCellViewer({ item }: { item: z.infer<typeof agentSchema> }) {
  const isMobile = useIsMobile()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.header}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.header}</SheetTitle>
          <SheetDescription>AI Agent Details</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                  {item.status === "Active" ? (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                  ) : (
                    <Brain className="text-blue-500 dark:text-blue-400" />
                  )}
                  {item.status}
                </Badge>
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                  {item.type}
                </Badge>
              </div>
              <div className="font-mono text-sm">{item.balance}</div>
            </div>

            {item.status === "Training" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Training Progress</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">Estimated completion: 2 hours</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Skills ({item.skills})</h4>
              {Number.parseInt(item.skills) > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {item.header === "Athena" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Research
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        Analysis
                      </Badge>
                      <Badge className="justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 truncate">
                        Summary
                      </Badge>
                      <Badge className="justify-start bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 truncate">
                        Citation
                      </Badge>
                      <Badge className="justify-start bg-red-500/10 text-red-500 hover:bg-red-500/20 truncate">
                        Fact-check
                      </Badge>
                    </>
                  )}
                  {item.header === "Artemis" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Data Mining
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        Visualization
                      </Badge>
                      <Badge className="justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 truncate">
                        Prediction
                      </Badge>
                      <Badge className="justify-start bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 truncate">
                        Reporting
                      </Badge>
                      <Badge className="justify-start bg-red-500/10 text-red-500 hover:bg-red-500/20 truncate">
                        Anomaly
                      </Badge>
                      <Badge className="justify-start bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 truncate">
                        Clustering
                      </Badge>
                    </>
                  )}
                  {/* Keep other agent skills but add truncate class to all badges */}
                  {item.header === "Hermes" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Messaging
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        Translation
                      </Badge>
                      <Badge className="justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 truncate">
                        Scheduling
                      </Badge>
                    </>
                  )}
                  {item.header === "Apollo" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Writing
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        Poetry
                      </Badge>
                      <Badge className="justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 truncate">
                        Music
                      </Badge>
                      <Badge className="justify-start bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 truncate">
                        Art
                      </Badge>
                    </>
                  )}
                  {item.header === "Hephaestus" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Prototyping
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        3D Modeling
                      </Badge>
                    </>
                  )}
                  {item.header === "Demeter" && (
                    <>
                      <Badge className="justify-start bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 truncate">
                        Inventory
                      </Badge>
                      <Badge className="justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 truncate">
                        Scheduling
                      </Badge>
                      <Badge className="justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 truncate">
                        Optimization
                      </Badge>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills acquired yet</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recent Activity</h4>
              {item.status === "Active" ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Last active:</span>
                    <span>{item.lastActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasks completed today:</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earnings today:</span>
                    <span className="font-mono">0.03 ETH</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Agent is currently in training</p>
              )}
            </div>
          </div>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat with Agent
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Add Skills
            </Button>
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              Manage Wallet
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

