document.addEventListener('DOMContentLoaded', function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const startYear = month < 7 ? year - 1 : year;
  const schoolYear = `${startYear}-${startYear + 1}`;

  document.getElementById('schoolYear').value = schoolYear;

  // Log form data to console instead of submitting
  const form = document.querySelector('form');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // stops the actual page reload/submission

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log('Form submitted:', data);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
    });
  }
});