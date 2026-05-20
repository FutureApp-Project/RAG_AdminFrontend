import {useDraggable, useDroppable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import Box from "@mui/material/Box";
import {forwardRef, type MutableRefObject, type ReactNode} from "react";

/** DataTableDndRow is a draggable row for use in DataTable with drag & drop enabled. */
export const DataTableDnd = forwardRef<HTMLDivElement, { itemId: string | number, children: ReactNode }>(
	({ itemId, children }: { itemId: string | number, children: ReactNode }, ref) => {
		const {setNodeRef: setDroppableNodeRef} = useDroppable({id: `droppable${itemId}`});
		const {
			attributes,
			listeners,
			setNodeRef: setDraggableNodeRef,
			transform
		} = useDraggable({id: `draggable${itemId}`});
		const style = {
			transform: CSS.Transform.toString(transform),
			cursor: "move",
		};

		const combinedRef = (node: HTMLDivElement | null) => {
			setDraggableNodeRef(node);
			setDroppableNodeRef(node);
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
		};

		return <Box ref={combinedRef} style={style} {...attributes} {...listeners}>
			{children}
		</Box>;
	},
);

/*export default function forwardRef<HTMLDivElement, {itemId: string | number}>(function DataTableDnd({itemId, children}:
	{itemId: string | number, children: ReactNode}) {

});
*/