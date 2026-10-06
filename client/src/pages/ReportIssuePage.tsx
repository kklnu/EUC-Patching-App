import { useState, type ChangeEvent, type FormEvent } from 'react'
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
  errorDetails: '',
  affectedSoftware: '',
}

type FormErrors = Partial<Record<keyof NewIssueReport, string>>

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
  if (form.errorReceived && !form.errorDetails?.trim()) {
    errors.errorDetails = 'Enter the error message you received.'
  }
  return errors
}

function ReportIssuePage() {
  const [form, setForm] = useState<NewIssueReport>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [savedReport, setSavedReport] = useState<IssueReport | null>(null)

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
    const name = event.target.name as keyof NewIssueReport
    updateField(name, event.target.value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newErrors = validate(form)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const report = saveIssueReport({
      ...form,
      errorDetails: form.errorReceived ? form.errorDetails : undefined,
    })
    setSavedReport(report)
  }

  function startNewReport() {
    setForm(emptyForm)
    setErrors({})
    setSavedReport(null)
  }

  // Props shared by every text input, so each field only lists what differs
  function textInputProps(name: keyof NewIssueReport) {
    return {
      id: name,
      name,
      value: String(form[name] ?? ''),
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
          <FormField
            id="errorDetails"
            label="Error details"
            hint="Copy the error message exactly, or describe what it said."
            error={errors.errorDetails}
          >
            <textarea rows={3} {...textInputProps('errorDetails')} />
          </FormField>
        )}

        <button type="submit">Submit report</button>
      </form>
    </>
  )
}

export default ReportIssuePage
