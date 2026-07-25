document.addEventListener('DOMContentLoaded', function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const startYear = month < 7 ? year - 1 : year;
  const schoolYear = `${startYear}-${startYear + 1}`;

  document.getElementById('schoolYear').value = schoolYear;

  function setupYesNoToggle(yesEl, noEl, wrapperEl) {
    function updateVisibility() {
      wrapperEl.style.display = yesEl.checked ? 'block' : 'none';
    }

    yesEl.addEventListener('change', updateVisibility);
    noEl.addEventListener('change', updateVisibility);

    updateVisibility();
  }

  setupYesNoToggle(
    document.getElementById('is_ip_yes'),
    document.getElementById('is_ip_no'),
    document.getElementById('ip_specify_wrapper')
  );

  setupYesNoToggle(
    document.getElementById('is_4ps_yes'),
    document.getElementById('is_4ps_no'),
    document.getElementById('fourps_id_wrapper')
  );

  setupYesNoToggle(
    document.getElementById('disability_yes'),
    document.getElementById('disability_no'),
    document.getElementById('disability_type_wrapper')
  );

  const addressFieldMap = {
    current_house_no: 'permanent_house_no',
    current_street: 'permanent_street',
    current_barangay: 'permanent_barangay',
    current_city: 'permanent_city',
    current_province: 'permanent_province',
    current_country: 'permanent_country',
    current_zip: 'permanent_zip'
  };

  const sameYes = document.getElementById('same_as_current_yes');
  const sameNo = document.getElementById('same_as_current_no');

  function copyCurrentToPermanent() {
    Object.entries(addressFieldMap).forEach(([currentId, permanentId]) => {
      const currentEl = document.getElementById(currentId);
      const permanentEl = document.getElementById(permanentId);
      permanentEl.value = currentEl.value;
      permanentEl.readOnly = true;
    });
  }

  function unlockPermanentFields() {
    Object.values(addressFieldMap).forEach((permanentId) => {
      document.getElementById(permanentId).readOnly = false;
    });
  }

  function updateAddressMode() {
    if (sameYes.checked) {
      copyCurrentToPermanent();
    } else {
      unlockPermanentFields();
    }
  }

  sameYes.addEventListener('change', updateAddressMode);
  sameNo.addEventListener('change', updateAddressMode);

  Object.keys(addressFieldMap).forEach((currentId) => {
    document.getElementById(currentId).addEventListener('input', () => {
      if (sameYes.checked) {
        copyCurrentToPermanent();
      }
    });
  });

  updateAddressMode();

  const form = document.querySelector('form');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

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