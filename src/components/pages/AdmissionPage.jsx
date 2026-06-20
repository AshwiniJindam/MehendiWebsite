import { useEffect, useRef, useState } from 'react';
import { page } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';
import { buildReview, saveSubmission, showSubmissionError, validateStep } from '../../utils/admissionForm.js';

const html = page('ADMISSION PAGE', '<!-- ===== ADMIN LOGIN ===== -->');

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const containerRef = useRef(null);

  const goNext = (currentStep) => {
    if (!validateStep(currentStep)) return;
    const next = currentStep + 1;
    if (next === 5) buildReview();
    setSubmitted(false);
    setStep(next);
  };

  const goBack = (currentStep) => {
    setSubmitted(false);
    setStep(Math.max(1, currentStep - 1));
  };

  const setSubmitButtonLoading = (loading) => {
    const button = document.getElementById('submit-button');
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.textContent = 'Submitting...';
      button.disabled = true;
      return;
    }

    button.textContent = button.dataset.originalText || 'Submit';
    button.disabled = false;
  };

  const submit = async () => {
    if (submittingRef.current) return;

    document.getElementById('submission-error-message')?.remove();
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitButtonLoading(true);
    try {
      await saveSubmission();
      setSubmitted(true);
    } catch (error) {
      showSubmissionError(error);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      setSubmitButtonLoading(false);
    }
  };

  useEffect(() => {
    for (let index = 1; index <= 5; index += 1) {
      document.getElementById(`step-${index}`)?.classList.toggle('active', !submitted && index === step);
      const progress = document.getElementById(`prog-${index}`);
      progress?.classList.toggle('active', !submitted && index === step);
      progress?.classList.toggle('done', submitted || index < step);
    }
    document.getElementById('step-success')?.classList.toggle('active', submitted);
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, submitted]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleClick = (event) => {
      const trigger = event.target.closest('[onclick]');
      const action = trigger?.getAttribute('onclick') || '';
      if (!action) return;

      if (action.includes('nextStep(')) {
        event.preventDefault();
        event.stopPropagation();
        const nextMatch = action.match(/nextStep\((\d+)\)/);
        if (nextMatch) goNext(Number(nextMatch[1]));
        return;
      }

      if (action.includes('prevStep(')) {
        event.preventDefault();
        event.stopPropagation();
        const prevMatch = action.match(/prevStep\((\d+)\)/);
        if (prevMatch) goBack(Number(prevMatch[1]));
        return;
      }

      if (action.includes('submitForm()')) {
        event.preventDefault();
        event.stopPropagation();
        console.log('[Enrollment Debug] legacy submitForm click intercepted');
        void submit();
      }
    };

    const submitBtn = document.getElementById('submit-button');
    let submitBtnHandler = null;
    if (submitBtn) {
      submitBtn.removeAttribute('onclick');
      submitBtnHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Enrollment Debug] submit button clicked');
        void submit();
      };
      submitBtn.addEventListener('click', submitBtnHandler);
    }

    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
      if (submitBtn && submitBtnHandler) submitBtn.removeEventListener('click', submitBtnHandler);
    };
  }, [goBack, goNext, submit]);

  return <LegacyHtml html={html} ref={containerRef} />;
}
