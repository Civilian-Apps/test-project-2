'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTag, softDeleteTag } from '@/entities/tag/actions';
import { Tag, TagInput } from '@/entities/tag/types';
import { zodResolver } from '@hookform/resolvers/zod';

interface TagPickerProps {
  tags: Tag[];
}

export function TagPicker({ tags }: TagPickerProps) {
  const [visibleTags, setVisibleTags] = useState<Tag[]>(tags);
  const [showForm, setShowForm] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagInput>({
    resolver: zodResolver(TagInput),
    defaultValues: { name: '', color: '#aabbcc' },
  });

  const onSubmit = (values: TagInput) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createTag(values);
      if (result.error || !result.data) {
        setSubmitError(result.error?.message ?? 'Could not save tag.');
        return;
      }
      setVisibleTags((prev) => [result.data as Tag, ...prev]);
      reset();
      setShowForm(false);
    });
  };

  const onRemove = (id: string) => {
    setRemovingId(id);
    startTransition(async () => {
      const result = await softDeleteTag(id);
      setRemovingId(null);
      if (result.error) {
        return;
      }
      setVisibleTags((prev) => prev.filter((t) => t.id !== id));
    });
  };

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap gap-2'>
        {visibleTags.map((t) => (
          <span
            key={t.id}
            className='inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-sm'
            style={{ backgroundColor: t.color }}
          >
            <span>{t.name}</span>
            <button
              type='button'
              aria-label={`Remove ${t.name}`}
              onClick={() => onRemove(t.id)}
              disabled={removingId === t.id}
              className='inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/20'
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='tag-picker-name'>Name</Label>
            <Input id='tag-picker-name' aria-invalid={errors.name ? 'true' : 'false'} {...register('name')} />
            {errors.name?.message && (
              <p role='alert' className='text-sm text-destructive'>
                {errors.name.message}
              </p>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='tag-picker-color'>Color</Label>
            <Input
              id='tag-picker-color'
              placeholder='#aabbcc'
              aria-invalid={errors.color ? 'true' : 'false'}
              {...register('color')}
            />
            {errors.color?.message && (
              <p role='alert' className='text-sm text-destructive'>
                {errors.color.message}
              </p>
            )}
          </div>
          {submitError && (
            <p role='alert' className='text-sm text-destructive'>
              {submitError}
            </p>
          )}
          <div className='flex gap-2'>
            <Button type='submit' size='sm' disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={() => {
                reset();
                setSubmitError(null);
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type='button' size='sm' variant='secondary' onClick={() => setShowForm(true)} className='self-start'>
          <Plus size={14} />
          <span className='ml-1'>Add tag</span>
        </Button>
      )}
    </div>
  );
}
