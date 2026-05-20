import {
  closestCenter,
  DndContext,
 
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Icon } from "@iconify-icon/react";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useContext,
  type ReactElement,
  
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";

import type {
  ColumnDefTemplate,
  CellContext,
  VisibilityState,
  Cell,
  Row,
} from "@tanstack/react-table";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader, Grow,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import {renderToStaticMarkup} from "react-dom/server";
import {TransitionGroup} from "react-transition-group";
import {MobileContext} from "../context/MobileContext.tsx";
import styles from "../styles/DataTable.module.css";
import MemoizedCell from "./MemoizedCell.tsx";
import {DataTableDnd} from "./DataTableDnd.tsx";
import InfiniteScroll from "react-infinite-scroll-component";

export interface Action<T> {
  icon: string;
  label: string;
  handler: (id: number, item: T) => void;
  disabled?: (id: number) => boolean;
}

export interface ColumnDefinition<T> {
  propertyKey: Extract<keyof T, string>;
  header?: string;
  icon?: ReactElement | ((cell: Cell<unknown, unknown>) => ReactElement);
  isTitle?: boolean;
  id?: string;
  cell?: ColumnDefTemplate<CellContext<T, unknown>>;
  enableSorting?: boolean;
  isHidden?: boolean;
  showIf?: (cell: Cell<T, unknown>) => boolean;
  key?: (data: T) => string;
  defaultValue?: string;
}

const colorTable: Record<string, string> = {
  "bx-show": "#0080AB",
  "bx-pencil": "#4CAF50",
  "bx-trash": "#df1c40",
  "bxs-bell-plus": "orange",
  "bxs-bar-chart-square": "blue",
  "proicons:checkbox-list": "darkblue",
  "bx-file": "#0080AB",
  "bx-download": "black",
};

const HoverLabelButton = styled("button")(({ theme }) => ({
  minWidth: 20,
  paddingLeft: 0,
  paddingRight: 0,
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  "&:hover": {
    color: theme.palette.secondary.contrastText,
    backgroundColor: "transparent",
  },
}));

export default function DataTable<T extends object>({
  columns,
  data,
  idColumn,
  actions,
  descSort,
  disableSortingByDefault = true,
  enableDnd,
  onDragEnd,
  createButton,
}: {
  columns: ColumnDefinition<T>[];
  data: T[] | undefined;
  idColumn?: keyof T;
  actions?: Action<T>[];
  descSort?: boolean;
  disableSortingByDefault?: boolean;
  enableDnd?: boolean;
  onDragEnd?: (from: number, to: number) => void;
  createButton?: React.ReactNode;
}) {
  const itemsPerBatch = 25;
  const [globalFilter, setGlobalFilter] = useState("");
  const [renderedCount, setRenderedCount] = useState(itemsPerBatch);
  const isMobile = useContext(MobileContext);

  /* ensure actualData remains up‑to‑date for action handlers */
  const actualData = useRef(data);
  useEffect(() => {
    actualData.current = data;
    setRenderedCount(itemsPerBatch); // reset scroll when new data arrive
  }, [data, itemsPerBatch]);

  const getId = useCallback(
    (column: ColumnDefinition<T> | undefined) => column?.id || column?.propertyKey || "",
    []
  );
  const columnHelper = createColumnHelper<T>();

  const generatedColumns = useMemo(() => {
    const base = columns.map((column) =>
      columnHelper.accessor((row) => row[column.propertyKey], {
        id: getId(column),
        header: column.header,
        enableSorting: column.enableSorting || !disableSortingByDefault,
        enableHiding: column.isHidden,
        ...(column.cell && { cell: column.cell }),
      })
    );

    if (idColumn && actions && actions.length > 0) {
      base.push(
        columnHelper.accessor((row) => row[idColumn], {
          id: "actions",
          header: "",
          enableSorting: false,
          cell: (info) => (
            <CardActions
              sx={{
                mt: "auto",
                justifyContent: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {actions.map((action, index) => (
                <Tooltip key={index} title={action.label}>
                  <HoverLabelButton
                    onClick={() =>
                      action.handler(
                        info.getValue() as number,
                        actualData.current!.find(
                          (row) => row[idColumn] == info.getValue()
                        )!
                      )
                    }
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Icon
                      icon={action.icon}
                      width={24}
                      height={24}
                      style={{
                        color: action.disabled?.(info.getValue() as number)
                          ? "#CCC"
                          : colorTable[action.icon],
                      }}
                    />
                  </HoverLabelButton>
                </Tooltip>
              ))}
            </CardActions>
          ),
        })
      );
    }

    return base;
  }, [columns, columnHelper, idColumn, actions, disableSortingByDefault, getId]);

  const columnVisibility: VisibilityState = {};
  columns
    .filter((column) => column.isHidden)
    .map((column) => column.propertyKey)
    .forEach((propertyKey) => (columnVisibility[propertyKey] = false));

  const table = useReactTable<T>({
    data: data ?? [],
    columns: generatedColumns,
    getRowId: idColumn ? (row) => `${row[idColumn]}` : undefined,
    initialState: {
      sorting: [{ id: columns[0].propertyKey, desc: descSort ?? false }],
    },
    state: { globalFilter, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const cell = row
        .getAllCells()
        .find((cell) => cell.column.id === columnId);
      if (!cell) return false;
      const renderedValue = renderToStaticMarkup(
        flexRender(cell.column.columnDef.cell, cell.getContext())
      );
      const val = String(renderedValue ?? "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .toLowerCase();
      return val.includes(filterValue.toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    defaultColumn: { sortingFn: "alphanumeric" },
  });

  const visibleRows = table.getRowModel().rows;
  const displayedRows = visibleRows.slice(0, renderedCount);

  const headerMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    table.getHeaderGroups().forEach((group) =>
      group.headers.forEach((header) => {
        map.set(
          header.column.id,
          flexRender(header.column.columnDef.header, header.getContext())
        );
      })
    );
    return map;
  }, [table]);

  const sensors = useSensors(useSensor(PointerSensor));
  const loadMore = useCallback(() => {
    setRenderedCount((prev) =>
      Math.min(prev + itemsPerBatch, visibleRows.length)
    );
  }, [itemsPerBatch, visibleRows.length]);

  if (!data) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const from = event?.active.id;
    const to = event?.over?.id;
    if (typeof from !== "string" || typeof to !== "string") return;
    onDragEnd?.(+from.replace("draggable", ""), +to.replace("droppable", ""));
  };

  const titleColumn = columns.find((column) => column.isTitle);

  const cardJsx = (row: Row<T>): ReactElement => <Card
      key={row.id}
      variant="outlined"
      sx={{
        background: "rgba(231, 231, 240, 0.12)", // Very light blue-grey tint
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(255, 255, 255, 0.7)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
      }}
  >
    {titleColumn && (
        <CardHeader
            key={titleColumn.key?.(row.original) ?? JSON.stringify(row.getValue(getId(titleColumn)))}
            title={
              <MemoizedCell
                  cell={
                    row
                        .getVisibleCells()
                        .filter(
                            cell => cell.column.id == getId(titleColumn)
                        )[0] as Cell<unknown, unknown>
                  }
                  icon={titleColumn.icon}
                  contentOnly={true}
                  defaultValue={titleColumn.defaultValue}
              />
            }
            sx={{
              borderRadius: 2.5,
              bgcolor: "primary.main",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              color: "rgba(255, 255, 255, 0.9)",
              py: 1,
              wordBreak: "break-word",
              "& .MuiCardHeader-title": {
                fontSize: "0.9rem",
                fontWeight: 700,
              },
            }}
        />
    )}

    <CardContent
        sx={{
          p: 1,
          "&:last-child": { pb: 0 },
          "& .column-header": {
            // Style for column headers/labels
            fontSize: "0.5rem",
            fontWeight: 300,
            color: "rgba(0, 0, 0, 0.87)", // Dark color for headers
            display: "inline-block",
            minWidth: "100px",
            verticalAlign: "top",
          },
          "& .data-value": {
            // Style for data values
            fontSize: "0.5rem",
            fontWeight: 200,
            color: "rgba(0, 0, 0, 0.6)", // Lighter color for values
            display: "inline-block",
            wordBreak: "break-word",
          },
        }}
    >
      <TransitionGroup component={null}>
        {row
            .getVisibleCells()
            .filter((cell) => cell.column.id !== "actions")
            .map((cell) =>
                cell.column.id !== getId(titleColumn) &&
                columns
                    .find((column) => cell.column.id == getId(column))
                    ?.showIf?.(cell) !== false &&
                    <MemoizedCell
                        key={cell.id}
                        cmpKey={columns.find((column) => cell.column.id == getId(column))?.key as (data: unknown) => string}
                        cell={cell as Cell<unknown, unknown>}
                        icon={
                          columns.find((column) => cell.column.id == getId(column))
                              ?.icon
                        }
                        headerLabel={headerMap.get(cell.column.id)}
                        contentOnly={cell.column.id === "actions"}
                        defaultValue={columns.find((column) => cell.column.id == getId(column))?.defaultValue}
                    />
            )
        }
      </TransitionGroup>
    </CardContent>

    {actions && actions.length > 0 && (
        <MemoizedCell
            cell={
              row
                  .getVisibleCells()
                  .find((cell) => cell.column.id == "actions") as Cell<
                  unknown,
                  unknown
              >
            }
            contentOnly={true}
        />
    )}
  </Card>;
  const renderCards = () => (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(auto-fill, minmax(280px, 1fr))",
        },
      }}
    >
      <TransitionGroup component={null}>
        {displayedRows.map((row) => (
            <Grow key={row.id} in timeout={800} style={{ transformOrigin: '0 0 0', height: "100%" }}>
              {enableDnd ? <DataTableDnd itemId={row.id}>{cardJsx(row)}</DataTableDnd> : cardJsx(row)}
            </Grow>
        ))}
      </TransitionGroup>

      {displayedRows.length === 0 && (
        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Keine Daten vorhanden
          </Typography>
        </Card>
      )}
    </Box>
  );

  const cardsJsx = enableDnd ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {renderCards()}
    </DndContext>
  ) : (
    renderCards()
  );

  return (
    <div>
      <div className={isMobile ? styles.toolbarMobile : styles.toolbarDesktop}>
        {createButton ?? <div></div>}

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Suche..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchField}
          />
          <div className={styles.searchButton}>
            <button>
              <Icon icon="fa-solid:search" />
            </button>
          </div>
        </div>
      </div>

      <InfiniteScroll
        dataLength={displayedRows.length}
        next={loadMore}
        hasMore={displayedRows.length < visibleRows.length}
        loader={
          <Typography align="center" sx={{ py: 2 }}>
            Lade mehr...
          </Typography>
        }
        scrollThreshold={0.9}
        style={{ overflow: "visible" }}
      >
        {cardsJsx}
      </InfiniteScroll>
    </div>
  );
}
