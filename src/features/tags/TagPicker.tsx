'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { createTag, softDeleteTag } from '@/entities/tag/actions';
import { Tag, TagInput } from '@/entities/tag/types';
import { zodResolver } from '@hookform/resolvers/zod';

interface TagPickerProps {
  tags: Tag[];
}

export function TagPicker({ tags }: TagPickerProps) {
  const [items, setItems] = useState<Tag[]>(tags);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagInput>({
    resolver: zodResolver(TagInput),
    defaultValues: { name: '', color: '#888888' },
  });

  const onSubmit = async (values: TagInput) => {
    const result = await createTag(values);
    if (result.error) {
      toast({
        title: 'Could not save tag',
        description: result.error.error_code,
        variant: 'destructive',
      });
      return;
    }
    setItems((prev) => [...prev, result.data]);
    reset();
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    const previous = items;
    setItems((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      const result = await softDeleteTag({ id });
      if (result.error) {
        setItems(previous);
        toast({
          title: 'Could not remove tag',
          description: result.error.error_code,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      <ul className='flex flex-wrap gap-2' aria-label='Your tags'>
        {items.map((tag) => (
          <li key={tag.id}>
            <span
              className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white'
              style={{ backgroundColor: tag.color }}
            >
              <span>{tag.name}</span>
              <button
                type='button'
                aria-label={`Remove tag ${tag.name}`}
                onClick={() => handleRemove(tag.id)}
                disabled={isPending}
                className='inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/20'
              >
                <X size={12} />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {open ? (
        <form
          aria-label='Add tag'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='flex flex-col gap-3 rounded-md border border-zinc-800 p-3'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='tag-name'>Tag name</Label>
            <Input
              id='tag-name'
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'tag-name-error' : undefined}
              {...register('name')}
            />
            {errors.name?.message && (
              <p id='tag-name-error' role='alert' className='text-sm text-destructive'>
                {errors.name.message}
              </p>
            )}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='tag-color'>Color</Label>
            <Input
              id='tag-color'
              aria-invalid={errors.color ? 'true' : 'false'}
              aria-describedby={errors.color ? 'tag-color-error' : undefined}
              {...register('color')}
            />
            {errors.color?.message && (
              <p id='tag-color-error' role='alert' className='text-sm text-destructive'>
                {errors.color.message}
              </p>
            )}
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <Button type='button' variant='secondary' size='sm' onClick={() => setOpen(true)} className='self-start'>
          <Plus size={14} className='mr-1' />
          Add tag
        </Button>
      )}
    </div>
  );
}
