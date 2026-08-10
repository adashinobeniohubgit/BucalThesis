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
    // 1.1 Populate "Last School Year Completed" Dropdown
    // ----------------------------------------------------
    const lastSchoolYearSelect = document.getElementById('last_school_year_completed');
    if (lastSchoolYearSelect) {
        const currentYear = new Date().getFullYear();
        // Max completed school year ends at previous year (e.g., in 2026 -> 2024-2025)
        const maxEndYear = currentYear - 1;
        const minStartYear = 2001;

        // Clear existing options except placeholder
        lastSchoolYearSelect.innerHTML = '<option value="" disabled selected>Select School Year</option>';

        for (let endYear = maxEndYear; endYear > minStartYear; endYear--) {
            const startYear = endYear - 1;
            const schoolYearText = `${startYear}-${endYear}`;

            const option = document.createElement('option');
            option.value = schoolYearText;
            option.textContent = schoolYearText;

            lastSchoolYearSelect.appendChild(option);
        }
    }

    // ----------------------------------------------------
    // 1.2 Auto-fill Date Answered (YYYY-MM-DD)
    // ----------------------------------------------------
    const dateAnsweredInput = document.getElementById('date_answered');
    if (dateAnsweredInput) {
        const today = new Date();
        // Formats to YYYY-MM-DD
        dateAnsweredInput.value = today.toISOString().split('T')[0];
    }

    // ----------------------------------------------------
    // 2. Auto-compute Age from Birthdate
    // ----------------------------------------------------
    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');

    function calculateAge() {
        if (!birthdateInput || !ageInput || !birthdateInput.value) return;

        const [y, m, d] = birthdateInput.value.split('-').map(Number);
        const birthDate = new Date(y, m - 1, d); // constructed in local time, no UTC shift

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

});