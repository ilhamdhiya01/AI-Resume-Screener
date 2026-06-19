import React from 'react';

import DocumentItem from './DocumentItem';

const DocumentList = React.memo(() => {
  return (
    <div className="mt-6 space-y-4">
      <DocumentItem
        status="PROCESSING"
        score={92}
        fileName="John_Doe_Software_Engineer.docx"
        date="Oct 24, 2026"
        time="2:30 PM"
      />
    </div>
  );
});

DocumentList.displayName = 'DocumentList';

export default DocumentList;
