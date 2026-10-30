-- Add configurable radio choices to amaliah items.
ALTER TYPE "InputType" ADD VALUE 'RADIO';

ALTER TABLE "amaliah_items"
ADD COLUMN "options" JSONB;
