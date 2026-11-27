-- Admin can cancel a quote (homeowner not going ahead).
ALTER TYPE "QuoteStatus" ADD VALUE IF NOT EXISTS 'cancelled';
