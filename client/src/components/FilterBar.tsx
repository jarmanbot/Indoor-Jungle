import { Filter, AlignJustify } from "lucide-react";

interface FilterBarProps {
  title: string;
}

const FilterBar = ({ title }: FilterBarProps) => {
  return (
    <div className="px-4 py-3 bg-neutral-lightest">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-darkest">{title}</h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-1 bg-neutral-light rounded-full text-sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </button>
          <button className="flex items-center px-3 py-1 bg-neutral-light rounded-full text-sm">
            <AlignJustify className="h-4 w-4 mr-1" />
            Sort
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
