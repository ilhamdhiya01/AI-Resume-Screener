'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useProfile } from '@/lib/hooks/settings/useProfile';
import { notify } from '@/lib/utils/toast';
import { ProfileSchema, profileSchema } from '@/schemas/settings.schemas';

/**
 * @description Profile tab content with functional form.
 */
const ProfileTab = React.memo(() => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        jobTitle: profile.jobTitle || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile, reset]);

  const initials =
    profile?.firstName?.charAt(0)?.toUpperCase() ||
    profile?.email?.charAt(0)?.toUpperCase() ||
    'U';

  const onSubmit = async (data: ProfileSchema) => {
    try {
      await updateProfile(data);
      notify({
        type: 'success',
        title: 'Profile Saved',
        description: 'Your profile information has been updated.',
      });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Could not save profile.',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        Profile Information
      </h2>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-600">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            {profile?.name || 'User'}
          </p>
          <p className="text-xs text-slate-500">{profile?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            {...register('firstName')}
            label="First Name"
            placeholder="e.g. Sarah"
            fullWidth
            error={errors.firstName?.message}
          />
          <Input
            {...register('lastName')}
            label="Last Name"
            placeholder="e.g. Jenkins"
            fullWidth
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email Address"
          value={profile?.email || ''}
          disabled
          fullWidth
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            {...register('jobTitle')}
            label="Job Title"
            placeholder="e.g. HR Director"
            fullWidth
            error={errors.jobTitle?.message}
          />
          <Input
            {...register('phoneNumber')}
            label="Phone Number"
            placeholder="e.g. +62 812 3456 7890"
            fullWidth
            error={errors.phoneNumber?.message}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="contained"
            label="Save Changes"
            isLoading={isLoading || isUpdating}
            disabled={!isDirty}
          />
        </div>
      </form>
    </div>
  );
});

ProfileTab.displayName = 'ProfileTab';

export default ProfileTab;
