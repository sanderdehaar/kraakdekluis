import { useState } from 'react'

import ActionButton from '../../buttons/ActionButton/ActionButton'
import BaseModal from '../BaseModal/BaseModal'

type ResultType = 'win' | 'fail' | 'clue'

type CrackModalProps = {
  result: {
    status: ResultType
    prize?: string
    clue?: string
  }
  isClaimed: boolean
  onClose: () => void
  onSubmitContact?: (name: string, email: string) => void
  onViewVaultLocations: () => void
}

function CrackModal({
  result,
  isClaimed,
  onClose,
  onSubmitContact,
  onViewVaultLocations,
}: CrackModalProps) {
  const [step, setStep] = useState<'result' | 'contact' | 'success'>(
    'result',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleContinue = () => {
    if (result.status === 'win' && !isClaimed) {
      setStep('contact')
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmitContact?.(name, email)
    setStep('success')
  }

  const buttonWrapper =
    'modal-actions mt-8 flex w-full flex-col items-center justify-center gap-3'

  const buttonClass = '!bg-black !text-white'

  const renderResult = () => {
    if (result.status === 'win') {
      return (
        <>
          <div className="modal-icon">🏆</div>

          <p className="modal-eyebrow">CONGRATULATIONS</p>

          <h2 id="crack-modal-title" className="modal-title">
            YOU UNLOCKED THE PRIZE
          </h2>

          {result.prize && (
            <div className="modal-prize border-2 border-[#ff5a00] !bg-transparent !text-black">
              <strong className="modal-prize__name !text-black">
                {result.prize}
              </strong>
            </div>
          )}

          <p className="modal-body">
            {isClaimed
              ? 'This prize has already been claimed.'
              : 'You cracked the vault! Enter your details to claim your prize.'}
          </p>

          {!isClaimed && (
            <div className={buttonWrapper}>
              <ActionButton
                onClick={handleContinue}
                className={buttonClass}
              >
                CLAIM PRIZE
              </ActionButton>
            </div>
          )}
        </>
      )
    }

    if (result.status === 'clue') {
      return (
        <>
          <div className="modal-icon">🔎</div>

          <p className="modal-eyebrow">CLUE FOUND</p>

          <h2 id="crack-modal-title" className="modal-title">
            HERE'S YOUR CLUE
          </h2>

          {result.clue && (
            <p className="modal-clue">
              {result.clue}
            </p>
          )}

          <div className={buttonWrapper}>
            <ActionButton
              onClick={onViewVaultLocations}
              className={buttonClass}
            >
              VIEW VAULT LOCATIONS
            </ActionButton>
          </div>
        </>
      )
    }

    return (
      <>
        <div className="modal-icon">🔒</div>

        <p className="modal-eyebrow">TRY AGAIN</p>

        <h2 id="crack-modal-title" className="modal-title">
          VAULT LOCKED
        </h2>

        <p className="modal-body">
          Unfortunately, this code didn't unlock the prize.
        </p>

        <div className={buttonWrapper}>
          <ActionButton
            onClick={onViewVaultLocations}
            className={buttonClass}
          >
            VIEW VAULT LOCATIONS
          </ActionButton>
        </div>
      </>
    )
  }

  if (step === 'contact') {
    return (
      <BaseModal
        onClose={onClose}
        ariaLabelledBy="crack-modal-title"
      >
        <p className="modal-eyebrow">CLAIM YOUR PRIZE</p>

        <h2 id="crack-modal-title" className="modal-title">
          YOUR DETAILS
        </h2>

        <p className="modal-body">
          Enter your details below so we can contact you about your prize.
        </p>

        <form
          onSubmit={handleSubmit}
          className="claim-form mt-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-2 text-left">
            <span className="font-bold uppercase tracking-[0.08em]">
              Name
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded border-2 border-black px-4 py-3 outline-none"
              placeholder="Your name"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="font-bold uppercase tracking-[0.08em]">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded border-2 border-black px-4 py-3 outline-none"
              placeholder="Your email"
            />
          </label>

          <div className="modal-actions mt-4 flex w-full flex-col items-center justify-center gap-3">
            <ActionButton
              type="submit"
              className={buttonClass}
            >
              SEND DETAILS
            </ActionButton>
          </div>
        </form>
      </BaseModal>
    )
  }

  if (step === 'success') {
    return (
      <BaseModal
        onClose={onClose}
        ariaLabelledBy="crack-modal-title"
      >
        <div className="modal-icon">🎉</div>

        <p className="modal-eyebrow">ALL DONE</p>

        <h2 id="crack-modal-title" className="modal-title">
          PRIZE CLAIMED
        </h2>

        <p className="modal-body">
          Your details have been received. We will contact you within 2–6 days
          about your prize.
        </p>

        <p className="modal-body mt-4">
          A confirmation email has also been sent to you.
        </p>
      </BaseModal>
    )
  }

  return (
    <BaseModal
      onClose={onClose}
      ariaLabelledBy="crack-modal-title"
    >
      {renderResult()}
    </BaseModal>
  )
}

export default CrackModal