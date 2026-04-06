'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { FeedbackInput } from '@/entities/feedback/types';
import { createSupabaseBrowserClient } from '@/libs/supabase/supabase-browser-client';
import { zodResolver } from '@hookform/resolvers/zod';

export function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(FeedbackInput),
    defaultValues: { subject: '', body: '' },
  });

  const onSubmit = async (values: FeedbackInput) => {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-feedback`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: { error_code?: string; message?: string };
        } | null;
        const errorCode = payload?.error?.error_code ?? 'UNKNOWN_ERROR';
        toast({
          title: 'Could not send feedback',
          description: errorCode,
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Thanks — feedback received' });
      reset();
      setOpen(false);
    } catch {
      toast({
        title: 'Could not send feedback',
        description: 'NETWORK_ERROR',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type='button' className='flex items-center gap-2 text-left text-neutral-400 hover:text-neutral-100'>
          <MessageSquare size={16} />
          <span>Send feedback</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>Tell us what&apos;s on your mind. We read every message.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='feedback-subject'>Subject</Label>
            <Input
              id='feedback-subject'
              aria-invalid={errors.subject ? 'true' : 'false'}
              aria-describedby={errors.subject ? 'feedback-subject-error' : undefined}
              {...register('subject')}
            />
            {errors.subject?.message && (
              <p id='feedback-subject-error' role='alert' className='text-sm text-destructive'>
                {errors.subject.message}
              </p>
            )}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='feedback-body'>Body</Label>
            <Textarea
              id='feedback-body'
              rows={5}
              aria-invalid={errors.body ? 'true' : 'false'}
              aria-describedby={errors.body ? 'feedback-body-error' : undefined}
              {...register('body')}
            />
            {errors.body?.message && (
              <p id='feedback-body-error' role='alert' className='text-sm text-destructive'>
                {errors.body.message}
              </p>
            )}
          </div>
          <div className='flex justify-end'>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
