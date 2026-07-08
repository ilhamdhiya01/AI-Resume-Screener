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
      <header className="flex h-16 items-center border-b border-slate-300 bg-[#f7fafc]">
        <nav className="flex w-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
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
            <div className="flex flex-col">
              <span className="truncate font-bold">{fileName}</span>
              <span className="text-sm leading-none text-slate-500">
                Parsed successfully
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
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
