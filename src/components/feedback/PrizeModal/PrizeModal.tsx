import { useMemo, useState } from 'react'

import BaseModal from '../BaseModal/BaseModal'

type ResultType = 'win' | 'fail' | 'clue'

type PrizeModalProps = {
  result: {
    status: ResultType
    prize?: string
    clue?: string
  }
  isClaimed?: boolean
  onClose: () => void
  onSubmitContact?: (payload: {
    name: string
    email: string
  }) => Promise<boolean>
}

function PrizeModal({
  result,
  isClaimed = false,
  onClose,
  onSubmitContact,
}: PrizeModalProps) {
  const isWin = result.status === 'win'
  const isClue = result.status === 'clue'

  const [step, setStep] = useState<
    'result' | 'contact' | 'success'
  >('result')

  const [form, setForm] = useState({
    name: '',
    email: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const canContinueToContact = isWin && !isClaimed

  const buttonLabel = useMemo(() => {
    if (isClaimed) return 'PRIZE ALREADY CLAIMED'
    if (step === 'contact') return 'SEND DETAILS'
    return 'CONTINUE'
  }, [isClaimed, step])

  async function handleContinue() {
    if (!canContinueToContact) {
      onClose()
      return
    }

    if (step === 'result') {
      setStep('contact')
      return
    }

    if (!form.name.trim() || !form.email.trim()) {
      setSubmitError('Please add your name and email.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const success = await onSubmitContact?.({
        name: form.name.trim(),
        email: form.email.trim(),
      })

      if (success === false) {
        setSubmitError(
          'We could not send the message right now. Please try again.',
        )
        return
      }

      setStep('success')
    } catch (error) {
      console.error('Failed to submit prize claim form:', error)

      setSubmitError(
        'We could not send the message right now. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BaseModal onClose={onClose}>
      <div className="modal-icon">
        {isWin && '🔓'}
        {result.status === 'fail' && '🔒'}
        {isClue && '🔎'}
      </div>

      {isWin && step === 'result' && (
        <>
          <p className="modal-eyebrow">YOU WON</p>
          <h2 className="modal-title">PRIZE FOUND</h2>

          <div className="modal-prize">
            <span className="modal-prize__label">YOUR PRIZE</span>
            <strong className="modal-prize__name">
              {result.prize}
            </strong>
          </div>

          {isClaimed && (
            <p className="modal-body modal-body--standalone">
              This prize has already been claimed.
            </p>
          )}
        </>
      )}

      {isWin && step === 'contact' && (
        <>
          <p className="modal-eyebrow">CONTACT DETAILS</p>
          <h2 className="modal-title">WE'LL REACH OUT</h2>

          <div className="claim-form">
            <label className="claim-form__field">
              <span>Name</span>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Your name"
              />
            </label>

            <label className="claim-form__field">
              <span>Email</span>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Your email"
              />
            </label>
          </div>

          {submitError && (
            <p className="form-error">{submitError}</p>
          )}
        </>
      )}

      {isWin && step === 'success' && (
        <>
          <p className="modal-eyebrow">THANK YOU</p>
          <h2 className="modal-title">WE'LL CONTACT YOU</h2>

          <p className="modal-body modal-body--standalone">
            Your prize claim has been received. We will contact
            you shortly with the next steps.
          </p>
        </>
      )}

      {result.status === 'fail' && (
        <>
          <p className="modal-eyebrow">
            THE SAFE STAYS LOCKED
          </p>

          <h2 className="modal-title">
            NOT THIS
            <br />
            TIME
          </h2>

          <p className="modal-body">
            Unfortunately, this code didn't unlock the prize.
          </p>
        </>
      )}

      {isClue && (
        <>
          <p className="modal-eyebrow">YOU FOUND A CLUE</p>

          <h2 className="modal-title">
            KEEP
            <br />
            LOOKING
          </h2>

          <div className="modal-clue">{result.clue}</div>
        </>
      )}

      <div className="modal-actions">
        {!isWin && !isClue && !isClaimed && (
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            CLOSE
          </button>
        )}

        {isWin && step !== 'success' && (
          <button
            type="button"
            onClick={handleContinue}
            className="modal-continue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SENDING...' : buttonLabel}
          </button>
        )}
      </div>
    </BaseModal>
  )
}

export default PrizeModal