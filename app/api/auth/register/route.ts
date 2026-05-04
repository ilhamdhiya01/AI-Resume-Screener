import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

import { registerUser } from '@/lib/services/auth.service';
import { RegisterInput } from '@/lib/types/auth.types';
import { registerSchema } from '@/lib/validations/auth.validation';

export const POST = async (request: NextRequest) => {
  try {
    const body: RegisterInput = await request.json();
    const validatedData = registerSchema.parse(body);

    const { user, verificationToken } = await registerUser(validatedData);

    return NextResponse.json(
      {
        message: 'Confirmation email sent. Please check your email.',
        user,
        verificationToken,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // ✅ WAJIB: Handle error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
