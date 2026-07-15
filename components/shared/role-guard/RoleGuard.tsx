import React from 'react';

import { Role } from '@/app/generated/prisma/enums';

interface RoleGuardProps {
  role: Role;
  allow: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard = ({
  role,
  allow,
  children,
  fallback = null,
}: RoleGuardProps) => {
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleGuard;
