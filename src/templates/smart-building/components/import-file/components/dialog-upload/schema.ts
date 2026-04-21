import { z } from 'zod'

export const TAG_OPTIONS = [
  { value: 'building', label: 'Building' },
  { value: 'area', label: 'Area' },
]

export const dialogUploadSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).trim(),
  tag: z.enum(
    TAG_OPTIONS.map((option) => option.value) as [string, ...string[]],
    { message: 'Tag is required' }
  ),
  floorName: z.string().trim().optional(),
})

export const dialogUploadSchemaWithFloor = dialogUploadSchema.superRefine(
  (values, ctx) => {
    if (values.tag !== 'building') return
    if (values.floorName && values.floorName.length > 0) return

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Floor name is required',
      path: ['floorName'],
    })
  }
)
