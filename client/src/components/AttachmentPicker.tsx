import { useState, type ChangeEvent } from 'react'
import FormField from './FormField.tsx'
import type { IssueAttachment } from '../types/issue.ts'

// Kept small because files are stored in the browser until the backend exists
const MAX_FILES = 3
const MAX_FILE_BYTES = 1024 * 1024

interface AttachmentPickerProps {
  attachments: IssueAttachment[]
  onChange: (attachments: IssueAttachment[]) => void
}

function isAllowedType(file: File) {
  return file.type.startsWith('image/') || file.type === 'application/pdf'
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Lets the user add screenshots or PDFs to a report, and remove them again.
function AttachmentPicker({ attachments, onChange }: AttachmentPickerProps) {
  const [problems, setProblems] = useState<string[]>([])

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // Reset the input so choosing the same file again still triggers a change
    event.target.value = ''

    const newProblems: string[] = []
    const added: IssueAttachment[] = []
    for (const file of files) {
      if (attachments.length + added.length >= MAX_FILES) {
        newProblems.push(`You can attach up to ${MAX_FILES} files.`)
        break
      }
      if (!isAllowedType(file)) {
        newProblems.push(`${file.name} isn't an image or PDF.`)
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        newProblems.push(`${file.name} is larger than 1 MB.`)
        continue
      }
      added.push({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await readAsDataUrl(file),
      })
    }

    setProblems(newProblems)
    if (added.length > 0) onChange([...attachments, ...added])
  }

  function removeAttachment(index: number) {
    setProblems([])
    onChange(attachments.filter((_, i) => i !== index))
  }

  return (
    <FormField
      id="attachments"
      label="Attachments (optional)"
      hint={`Screenshots or PDFs, up to ${MAX_FILES} files of 1 MB each.`}
      error={problems.length > 0 ? problems.join(' ') : undefined}
    >
      <input
        id="attachments"
        type="file"
        multiple
        accept="image/*,application/pdf"
        disabled={attachments.length >= MAX_FILES}
        onChange={handleFilesSelected}
      />
      {attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((attachment, index) => (
            <li key={`${attachment.name}-${index}`}>
              <span className="attachment-name">{attachment.name}</span>
              <span className="field-hint">{formatSize(attachment.size)}</span>
              <button
                type="button"
                className="button-secondary"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => removeAttachment(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormField>
  )
}

export default AttachmentPicker
