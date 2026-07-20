import classNames from 'classnames';
import React from 'react';

import Icon from '@/components/ui/icon';

interface HeaderProps {
  fileName?: string;
  zoomIn?: () => void;
  zoomOut?: () => void;
  resetZoom?: () => void;
  isDocx?: boolean;
}

const Header = React.memo<HeaderProps>(
  ({ fileName, zoomIn, zoomOut, resetZoom, isDocx }) => {
    return (
      <header className="flex h-auto min-h-16 items-center border-b border-slate-300 bg-[#f7fafc]">
        <nav className="flex w-full flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className={classNames('flex size-8 rounded', {
                'bg-red-200': !isDocx,
                'bg-blue-200': isDocx,
              })}
            >
              <Icon
                icon={isDocx ? 'TbFileTypeDoc' : 'TbFileTypePdf'}
                className={classNames('m-auto shrink-0', {
                  'text-red-700': !isDocx,
                  'text-blue-700': isDocx,
                })}
                size={18}
              />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold sm:text-base">
                {fileName}
              </span>
              <span className="text-xs leading-none text-slate-500 sm:text-sm">
                Parsed successfully
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Icon
              icon="TbZoomIn"
              className="cursor-pointer"
              size={20}
              onClick={zoomIn}
              title="Zoom in"
            />
            <Icon
              icon="TbZoomOut"
              className="cursor-pointer"
              size={20}
              onClick={zoomOut}
              title="Zoom out"
            />
            <Icon
              icon="TbZoomReset"
              className="cursor-pointer"
              size={20}
              onClick={resetZoom}
              title="Reset zoom"
            />
          </div>
        </nav>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
