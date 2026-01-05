export type ViewMode = 'grid' | 'masonry';

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

import { LayoutGrid, Layers } from 'lucide-react';

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                        ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                title="Grid View"
            >
                <LayoutGrid size={18} />
            </button>
            <button
                onClick={() => onViewModeChange('masonry')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'masonry'
                        ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                title="Masonry View"
            >
                <Layers size={18} />
            </button>
        </div>
    );
}
