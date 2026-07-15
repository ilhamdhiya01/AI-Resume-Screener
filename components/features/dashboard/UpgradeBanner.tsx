'use client';

import React from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const UpgradeBanner = () => (
  <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white shadow-sm sm:flex-row sm:items-center">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-white/20 p-3">
        <Icon icon="TbSparkles" size={24} />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Unlock Unlimited Potential</h2>
        <p className="text-sm text-indigo-100">
          Get precise AI insights, unlimited uploads, and priority processing
          with Indigo Pro.
        </p>
      </div>
    </div>
    <Button
      type="button"
      size="md"
      variant="outlined"
      label="Upgrade to Pro"
      className="border-white bg-white text-indigo-700 hover:bg-indigo-50"
    />
  </div>
);

export default UpgradeBanner;
