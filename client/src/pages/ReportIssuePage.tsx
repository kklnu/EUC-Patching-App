import { useState, type ChangeEvent, type FormEvent } from 'react'

import AttachmentPicker from '../components/AttachmentPicker.tsx'
import FormField from '../components/FormField.tsx'
import { saveIssueReport } from '../services/issueStorage.ts'
import type { IssueReport, NewIssueReport } from '../types/issue.ts'

const emptyForm: NewIssueReport = {
  userName: '',
  userEmail: '',
  pcName: '',
  affectedService: '',
  specificIssue: '',
  errorReceived: false,
  errorMessage: '',
  errorDetails: '',
  affectedSoftware: '',
  attachments: [],
}

type FormErrors = Partial<Record<keyof NewIssueReport, string>>

// The fields that use a plain text input or textarea
type TextFieldName = Exclude<
  keyof NewIssueReport,
  'errorReceived' | 'attachments'
>

function validate(form: NewIssueReport): FormErrors {
  const errors: FormErrors = {}
  if (!form.userName.trim()) errors.userName = 'Enter your name.'
  if (!form.userEmail.trim()) {
    errors.userEmail = 'Enter your email address.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.userEmail)) {
    errors.userEmail = 'Enter a valid email address, like name@company.com.'
  }
  if (!form.pcName.trim()) errors.pcName = 'Enter your PC name.'
  if (!form.affectedService.trim()) {
    errors.affectedService = 'Enter the affected service.'
  }
  if (!form.affectedSoftware.trim()) {
    errors.affectedSoftware = 'Enter the affected software.'
  }
  if (!form.specificIssue.trim()) errors.specificIssue = 'Describe the issue.'
  if (form.errorReceived && !form.errorMessage?.trim()) {
    errors.errorMessage = 'Enter the error message you received.'
  }
  return errors
}

function ReportIssuePage() {
  const [form, setForm] = useState<NewIssueReport>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [savedReport, setSavedReport] = useState<IssueReport | null>(null)
  const [saveError, setSaveError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof NewIssueReport>(
    name: K,
    value: NewIssueReport[K],
  ) {
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear the field's error as soon as the user changes it
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const name = event.target.name as TextFieldName
    updateField(name, event.target.value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = validate(form)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const report = await saveIssueReport({
        ...form,
        errorMessage: form.errorReceived ? form.errorMessage : undefined,
        errorDetails: form.errorReceived ? form.errorDetails : undefined,
      })
      setSaveError('')
      setSavedReport(report)
    } catch {
      setSaveError(
        "Your report couldn't be saved. Please try again, or contact IT directly.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function startNewReport() {
    setForm(emptyForm)
    setErrors({})
    setSaveError('')
    setSavedReport(null)
  }

  // Props shared by every text input, so each field only lists what differs
  function textInputProps(name: TextFieldName) {
    return {
      id: name,
      name,
      value: form[name] ?? '',
      onChange: handleTextChange,
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  if (savedReport) {
    return (
      <>
        <h1>Thanks, your issue has been reported</h1>
        <p>
          Reference: <code>{savedReport.id.slice(0, 8)}</code>
        </p>
        <button type="button" onClick={startNewReport}>
          Report another issue
        </button>
      </>
    )
  }

  return (
    <>
      <h1>Report a patching issue</h1>
      <p>Tell us about a problem you've had since the latest Windows update.</p>

      <form className="issue-form" onSubmit={handleSubmit} noValidate>
        <FormField id="userName" label="Your name" error={errors.userName}>
          <input
            type="text"
            autoComplete="name"
            {...textInputProps('userName')}
          />
        </FormField>

        <FormField id="userEmail" label="Your email" error={errors.userEmail}>
          <input
            type="email"
            autoComplete="email"
            {...textInputProps('userEmail')}
          />
        </FormField>

        <FormField
          id="pcName"
          label="PC name"
          hint="Find it in Settings > System > About, under Device name."
          error={errors.pcName}
        >
          <input type="text" {...textInputProps('pcName')} />
        </FormField>

        <FormField
          id="affectedService"
          label="Affected service"
          hint="For example: VPN, printing, email, Teams."
          error={errors.affectedService}
        >
          <input type="text" {...textInputProps('affectedService')} />
        </FormField>

        <FormField
          id="affectedSoftware"
          label="Affected software"
          hint="The application that isn't working, for example Outlook."
          error={errors.affectedSoftware}
        >
          <input type="text" {...textInputProps('affectedSoftware')} />
        </FormField>

        <FormField
          id="specificIssue"
          label="What's the issue?"
          error={errors.specificIssue}
        >
          <textarea rows={4} {...textInputProps('specificIssue')} />
        </FormField>

        <fieldset className="form-field">
          <legend>Did you receive an error message?</legend>
          <label className="radio-option">
            <input
              type="radio"
              name="errorReceived"
              checked={form.errorReceived}
              onChange={() => updateField('errorReceived', true)}
            />
            Yes
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="errorReceived"
              checked={!form.errorReceived}
              onChange={() => updateField('errorReceived', false)}
            />
            No
          </label>
        </fieldset>

        {form.errorReceived && (
          <>
            <FormField
              id="errorMessage"
              label="Error message"
              hint="Type the message exactly as it appeared, or the error code, for example 0x80070005."
              error={errors.errorMessage}
            >
              <input type="text" {...textInputProps('errorMessage')} />
            </FormField>

            <FormField
              id="errorDetails"
              label="What happened? (optional)"
              hint="For example, what you were doing when the error appeared."
            >
              <textarea rows={3} {...textInputProps('errorDetails')} />
            </FormField>
          </>
        )}

        <AttachmentPicker
          attachments={form.attachments}
          onChange={(attachments) => updateField('attachments', attachments)}
        />

        {saveError && (
          <p className="field-error" role="alert">
            {saveError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit report'}
        </button>
      </form>
    </>
  )
}

export default ReportIssuePage
