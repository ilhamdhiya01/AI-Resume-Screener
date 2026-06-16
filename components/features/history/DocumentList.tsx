import React from 'react';

import DocumentItem from './DocumentItem';

const DocumentList = React.memo(() => {
  return (
    <div className="mt-6 space-y-4">
      <DocumentItem />
    </div>
  );
});

DocumentList.displayName = 'DocumentList';

export default DocumentList;
