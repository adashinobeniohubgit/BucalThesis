document.addEventListener('DOMContentLoaded', function () {
    // ----------------------------------------------------
    // 1. Auto-fill School Year (e.g., 2026-2027)
    // ----------------------------------------------------
    const schoolYearInput = document.getElementById('school_year');
    if (schoolYearInput) {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        schoolYearInput.value = `${currentYear}-${nextYear}`;
    }

    // ----------------------------------------------------
    // 2. Auto-compute Age from Birthdate
    // ----------------------------------------------------
    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');

    function calculateAge() {
        if (!birthdateInput || !ageInput || !birthdateInput.value) return;

        const birthDate = new Date(birthdateInput.value);
        
        // Ensure valid date input
        if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Subtract 1 if the birthday hasn't occurred yet this year
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            ageInput.value = age >= 0 ? age : 0;
        } else {
            ageInput.value = '';
        }
    }

    if (birthdateInput) {
        // Recalculate whenever the birthdate is changed
        birthdateInput.addEventListener('change', calculateAge);
        birthdateInput.addEventListener('input', calculateAge);

        // Run once on page load in case a date value is already pre-filled
        calculateAge();
    }


    // ====================================================
    // 3. INDIGENOUS PEOPLES (IP) SPECIFY FIELD TOGGLE
    // ====================================================
    const ipYes = document.getElementById('ip_yes');
    const ipNo = document.getElementById('ip_no');
    const ipContainer = document.getElementById('ip_specify_container');
    const ipInput = document.getElementById('ip_community');

    function toggleIpSpecify() {
        if (!ipYes || !ipContainer || !ipInput) return;

        if (ipYes.checked) {
            ipContainer.classList.remove('hidden');
            ipInput.required = true;
        } else {
            ipContainer.classList.add('hidden');
            ipInput.required = false;
            ipInput.value = ''; // Clear value if reverted to 'No'
        }
    }

    if (ipYes && ipNo) {
        ipYes.addEventListener('change', toggleIpSpecify);
        ipNo.addEventListener('change', toggleIpSpecify);
        toggleIpSpecify(); // Run on load in case radio is pre-selected
    }


    // ====================================================
    // 4. 4Ps BENEFICIARY TOGGLE
    // ====================================================
    const fourPsYes = document.getElementById('4ps_yes');
    const fourPsNo = document.getElementById('4ps_no');
    const fourPsContainer = document.getElementById('4ps_specify_container');
    const fourPsInput = document.getElementById('4ps_id_no');

    function toggle4psSpecify() {
        if (!fourPsYes || !fourPsContainer || !fourPsInput) return;

        if (fourPsYes.checked) {
            fourPsContainer.classList.remove('hidden');
            fourPsInput.required = true;
        } else {
            fourPsContainer.classList.add('hidden');
            fourPsInput.required = false;
            fourPsInput.value = ''; // Clear value if reverted to 'No'
        }
    }

    if (fourPsYes && fourPsNo) {
        fourPsYes.addEventListener('change', toggle4psSpecify);
        fourPsNo.addEventListener('change', toggle4psSpecify);
        toggle4psSpecify(); // Run on load in case pre-selected
    }
});