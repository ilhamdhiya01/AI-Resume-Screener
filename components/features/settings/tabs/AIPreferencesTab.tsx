'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import Icon, { type IconName } from '@/components/ui/icon';
import { Select, SelectOption } from '@/components/ui/select';
import { usePreferences } from '@/lib/hooks/settings/usePreferences';
import { DocumentLanguage, ScoringStandard } from '@/lib/types/settings.types';
import { notify } from '@/lib/utils/toast';
import {
  PreferencesSchema,
  preferencesSchema,
} from '@/schemas/settings.schemas';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
];

const SCORING_STANDARDS: {
  value: ScoringStandard;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: 'ats',
    label: 'ATS-Friendly',
    description: 'Focus on strict keyword matching and standard formatting.',
    icon: 'TbListSearch',
  },
  {
    value: 'creative',
    label: 'Creative Roles',
    description:
      'Values portfolio links, non-traditional formats, and unique skills.',
    icon: 'TbPalette',
  },
  {
    value: 'executive',
    label: 'Executive',
    description: 'Emphasizes leadership metrics, business impact, and tenure.',
    icon: 'TbBriefcase',
  },
];

/**
 * @description AI Preferences tab with functional form controls.
 */
const AIPreferencesTab = React.memo(() => {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    usePreferences();

  const { control, handleSubmit, reset, formState } =
    useForm<PreferencesSchema>({
      resolver: zodResolver(preferencesSchema),
      defaultValues: {
        language: 'id',
        scoringStandard: 'ats',
        highSensitivityMode: false,
      },
    });

  useEffect(() => {
    if (preferences) {
      reset(preferences);
    }
  }, [preferences, reset]);

  const onSubmit = async (data: PreferencesSchema) => {
    try {
      await updatePreferences(data);
      notify({
        type: 'success',
        title: 'Preferences Saved',
        description: 'Your AI analysis preferences have been updated.',
      });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Update Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not save preferences.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          AI Analysis Preferences
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                High Sensitivity Mode
              </p>
              <p className="text-xs text-slate-500">
                Enable deeper semantic analysis to detect soft skills and subtle
                context. May increase processing time slightly.
              </p>
            </div>
            <Controller
              control={control}
              name="highSensitivityMode"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={classNames(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    {
                      'bg-indigo-600': field.value,
                      'bg-slate-300': !field.value,
                    }
                  )}
                >
                  <span
                    className={classNames(
                      'inline-block size-4 rounded-full bg-white transition-transform',
                      {
                        'translate-x-6': field.value,
                        'translate-x-1': !field.value,
                      }
                    )}
                  />
                </button>
              )}
            />
          </div>

          <Controller
            control={control}
            name="language"
            render={({ field }) => (
              <Select
                label="Analysis Output Language"
                options={LANGUAGE_OPTIONS}
                value={LANGUAGE_OPTIONS.find(
                  (option) => option.value === field.value
                )}
                onChange={(option: SelectOption | null) =>
                  field.onChange(option?.value as DocumentLanguage)
                }
                fullWidth
              />
            )}
          />

          <div>
            <p className="mb-3 text-sm font-medium text-slate-800">
              Scoring Standard
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Controller
                control={control}
                name="scoringStandard"
                render={({ field }) => (
                  <>
                    {SCORING_STANDARDS.map((standard) => (
                      <button
                        key={standard.value}
                        type="button"
                        onClick={() => field.onChange(standard.value)}
                        className={classNames(
                          'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all',
                          {
                            'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500':
                              field.value === standard.value,
                            'border-slate-200 bg-white hover:border-indigo-300':
                              field.value !== standard.value,
                          }
                        )}
                      >
                        <div
                          className={classNames('rounded-lg p-2', {
                            'bg-indigo-100 text-indigo-600':
                              field.value === standard.value,
                            'bg-slate-100 text-slate-500':
                              field.value !== standard.value,
                          })}
                        >
                          <Icon icon={standard.icon} size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {standard.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {standard.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="contained"
              label="Save Preferences"
              isLoading={isLoading || isUpdating}
              disabled={!formState.isDirty}
            />
          </div>
        </form>
      </div>
    </div>
  );
});

AIPreferencesTab.displayName = 'AIPreferencesTab';

export default AIPreferencesTab;
