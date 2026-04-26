import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const middleware = (request: NextRequest) => {
  // Untuk sementara, allow semua request
  // Nanti bisa ditambahin logic auth check
  return NextResponse.next();
};

export const config = {
  matcher: ['/dashboard/:path*'],
};
