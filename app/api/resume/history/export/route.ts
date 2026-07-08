import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { errorResponse } from '@/lib/utils/api-response';
import { exportResumeHistoryCSV } from '@/services/server/resume-history.service';

/**
 * @description Converts an array of objects to a CSV string.
 * @param {Record<string, unknown>[]} rows - The data rows.
 * @returns {string} CSV-formatted string.
 */
const toCSV = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  return lines.join('\n');
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const data = await exportResumeHistoryCSV(userId, {
      search: searchParam || undefined,
      status: statusParam?.toUpperCase() as
        | 'PENDING'
        | 'PROCESSING'
        | 'COMPLETED'
        | 'FAILED'
        | undefined,
      dateFrom: dateFromParam || undefined,
      dateTo: dateToParam || undefined,
    });

    const csv = toCSV(data);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resume-history.csv"',
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to export CSV',
      500
    );
  }
};
