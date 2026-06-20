import { createEnrollmentPayload, submitEnrollmentToGoogleSheets } from '../services/googleSheets.js';

function value(id) {
  return document.getElementById(id)?.value || '';
}

function required(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  const valid = Boolean(field?.value.trim());
  field?.classList.toggle('error', !valid);
  error?.classList.toggle('show', !valid);
  return valid;
}

export function validateStep(step) {
  let ok = true;

  if (step === 1) {
    ok = required('f-name', 'e-name') && ok;
    ok = required('f-dob', 'e-dob') && ok;

    const phone = value('f-phone').replace(/\D/g, '');
    const phoneField = document.getElementById('f-phone');
    const phoneError = document.getElementById('e-phone');
    const phoneValid = phone.length >= 10;
    phoneField?.classList.toggle('error', !phoneValid);
    phoneError?.classList.toggle('show', !phoneValid);
    ok = phoneValid && ok;

    ok = required('f-gender', 'e-gender') && ok;
    ok = required('f-address', 'e-address') && ok;
  }

  if (step === 2) {
    ok = required('f-type', 'e-type') && ok;
    ok = required('f-batch', 'e-batch') && ok;
    ok = required('f-mode', 'e-mode') && ok;
  }

  if (step === 4) {
    const terms = document.getElementById('c-terms')?.checked;
    const accurate = document.getElementById('c-accurate')?.checked;
    const signature = value('f-signature').trim();
    const valid = Boolean(terms && accurate && signature);
    document.getElementById('e-consent')?.classList.toggle('show', !valid);
    ok = valid && ok;
  }

  return ok;
}

export function buildReview() {
  const fields = [
    ['Personal Info', ''],
    ['Full Name', value('f-name')],
    ['Date of Birth', value('f-dob')],
    ['Gender', value('f-gender')],
    ['Phone', value('f-phone')],
    ['WhatsApp', value('f-whatsapp')],
    ['Email', value('f-email')],
    ['Address', value('f-address')],
    ['Course Details', ''],
    ['Course Type', value('f-type')],
    ['Batch', value('f-batch')],
    ['Mode', value('f-mode')],
    ['Start Date', value('f-startdate')],
    ['Background', ''],
    ['Experience', value('f-experience')],
    ['Prior Training', value('f-prior-training')],
    ['Reason', value('f-reason')],
    ['Source', value('f-source')],
  ];

  const review = document.getElementById('review-content');
  if (!review) return;
  review.innerHTML = fields
    .map(([key, val]) =>
      val === ''
        ? `<div class="review-section-label">${key}</div>`
        : val
          ? `<div class="review-row"><span class="key">${key}</span><span class="val">${val}</span></div>`
          : ''
    )
    .join('');
}

function setSubmissionMessage() {
  const admissionNumber = document.getElementById('admission-num');
  if (!admissionNumber) return;

  let message = document.getElementById('submission-status-message');
  if (!message) {
    message = document.createElement('p');
    message.id = 'submission-status-message';
    message.style.cssText = 'font-size:0.82rem;color:var(--text-muted);margin:0 0 1.5rem;';
    admissionNumber.insertAdjacentElement('afterend', message);
  }

  message.style.color = 'var(--text-muted)';
  message.textContent = 'Enrollment submitted successfully';
}

export function showSubmissionError(error) {
  console.error('[Enrollment Debug] submit failed:', error);

  let message = document.getElementById('submission-error-message');
  if (!message) {
    message = document.createElement('p');
    message.id = 'submission-error-message';
    message.style.cssText = 'font-size:0.82rem;color:#e53935;margin:1rem 0 0;';
    document.getElementById('step-5')?.appendChild(message);
  }

  message.textContent = error?.message || String(error || 'Unknown error');
}

export async function saveSubmission() {
  console.log('[Enrollment Debug] submit started');
  const payload = createEnrollmentPayload((id) => document.getElementById(id)?.value || '');
  const saved = await submitEnrollmentToGoogleSheets(payload);
  const admissionNumber = document.getElementById('admission-num');
  if (admissionNumber) admissionNumber.textContent = payload.phone || 'Submitted';
  setSubmissionMessage();
  return saved;
}
