import classNames from 'classnames';
import React from 'react';

import type { TabItemData } from './Tab';

interface TabItemProps extends TabItemData {
  isActive?: boolean;
  onClick?: (id: string) => void;
}

const TabItem = React.memo<TabItemProps>(
  ({ slug, label, isActive = false, onClick }) => {
    return (
      <label
        htmlFor={slug}
        className={classNames(
          'border-b-primary-700 text-primary-700 cursor-pointer border-b-2 px-0 py-2 font-semibold transition-colors',
          {
            'border-b-primary-700 text-primary-700 pointer-events-none':
              isActive,
            'border-b-transparent text-slate-500 hover:text-slate-600':
              !isActive,
          }
        )}
        onClick={() => onClick?.(slug)}
      >
        {label}
      </label>
    );
  }
);

TabItem.displayName = 'TabItem';

export default TabItem;
