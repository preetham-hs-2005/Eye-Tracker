import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortItem = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="glass-card p-3 cursor-grab">
      {id}
    </div>
  );
};

const PodiumDnD = ({ selected, setSelected }) => {
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(active.id);
    const newIndex = selected.indexOf(over.id);
    setSelected(arrayMove(selected, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={selected} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">{selected.map((driver) => <SortItem key={driver} id={driver} />)}</div>
      </SortableContext>
    </DndContext>
  );
};

export default PodiumDnD;
