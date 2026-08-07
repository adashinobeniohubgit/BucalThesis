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

    // ====================================================
    // 3. LRN REQUIRED TOGGLE (based on "With LRN?" question)
    // ====================================================
    const hasLrnYes = document.getElementById('has_lrn_yes');
    const hasLrnNo = document.getElementById('has_lrn_no');
    const lrnInput = document.getElementById('lrn_no');

    /**
     * Toggles the `required` state of the LRN input based on
     * whether the learner indicated they already have an LRN.
     *
     * - "Yes" -> LRN becomes required (must be a valid 12-digit number)
     * - "No"  -> LRN becomes optional and is cleared, since new
     *            enrollees won't have one yet
     */
    function toggleLrnRequired() {
        if (!hasLrnYes || !lrnInput) return;

        if (hasLrnYes.checked) {
            lrnInput.required = true;
        } else {
            lrnInput.required = false;
            lrnInput.value = ''; // Clear stale input if user switches back to 'No'
        }
    }

    if (hasLrnYes && hasLrnNo) {
        hasLrnYes.addEventListener('change', toggleLrnRequired);
        hasLrnNo.addEventListener('change', toggleLrnRequired);
        toggleLrnRequired(); // Run on load in case pre-selected
    }

    // ====================================================
    // 4. INDIGENOUS PEOPLES (IP) SPECIFY FIELD TOGGLE
    // ====================================================
    const ipYes = document.getElementById('ip_yes');
    const ipNo = document.getElementById('ip_no');
    const ipInput = document.getElementById('ip_community');

    function toggleIpSpecify() {
        if (!ipYes || !ipInput) return;

        if (ipYes.checked) {
            ipInput.disabled = false; // Makes it editable/clickable
            ipInput.required = true;
        } else {
            ipInput.disabled = true;  // Makes it unclickable
            ipInput.required = false;
            ipInput.value = '';       // Clears typed text if changed back to 'No'
        }
    }

    if (ipYes && ipNo) {
        ipYes.addEventListener('change', toggleIpSpecify);
        ipNo.addEventListener('change', toggleIpSpecify);
        toggleIpSpecify(); // Run on load in case pre-selected
    }

    // ====================================================
    // 5. 4Ps BENEFICIARY TOGGLE
    // ====================================================
    const fourPsYes = document.getElementById('4ps_yes');
    const fourPsNo = document.getElementById('4ps_no');
    const fourPsInput = document.getElementById('4ps_id_no');

    function toggle4psSpecify() {
        if (!fourPsYes || !fourPsInput) return;

        if (fourPsYes.checked) {
            fourPsInput.disabled = false; // Makes it clickable/editable
            fourPsInput.required = true;
        } else {
            fourPsInput.disabled = true;  // Makes it unclickable
            fourPsInput.required = false;
            fourPsInput.value = '';       // Clears text if changed to 'No'
        }
    }

    if (fourPsYes && fourPsNo) {
        fourPsYes.addEventListener('change', toggle4psSpecify);
        fourPsNo.addEventListener('change', toggle4psSpecify);
        toggle4psSpecify(); // Run on load in case pre-selected
    }

    // ====================================================
    // 6. LEARNER WITH DISABILITY (LWD) TOGGLE
    // ====================================================
    const lwdYes = document.getElementById('lwd_yes');
    const lwdNo = document.getElementById('lwd_no');
    const disabilityCheckboxes = document.querySelectorAll('input[name="disabilities"]');

    // Specific checkboxes needed for the Visual Impairment sub-rule below.
    // Selected by [value] since these checkboxes don't have individual IDs.
    const visualImpairmentCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment"]');
    const blindCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment - Blind"]');
    const lowVisionCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment - Low Vision"]');

    /**
     * Enables/disables all disability checkboxes based on the LWD answer,
     * then re-runs both validation rules so their error state stays in sync.
     *
     * - "Yes" -> checkboxes become clickable
     * - "No"  -> checkboxes are disabled and cleared
     */
    function toggleDisabilities() {
        if (!lwdYes || !disabilityCheckboxes.length) return;

        const isLwd = lwdYes.checked;

        disabilityCheckboxes.forEach(checkbox => {
            checkbox.disabled = !isLwd;

            // Reset selected options if user switches back to 'No'
            if (!isLwd) {
                checkbox.checked = false;
            }
        });

        validateDisabilityGroup();
        validateVisualImpairmentSubtype();
    }

    /**
     * RULE 1: When LWD = "Yes", at least one disability checkbox must be checked.
     *
     * Native `required` can't express "at least one checked" for a checkbox
     * group (it would instead require ALL of them), so this uses
     * setCustomValidity() on the first checkbox to surface a native
     * validation message on submit when the group is empty.
     */
    function validateDisabilityGroup() {
        if (!lwdYes || !disabilityCheckboxes.length) return;

        const anyChecked = Array.from(disabilityCheckboxes).some(checkbox => checkbox.checked);
        const isInvalid = lwdYes.checked && !anyChecked;

        disabilityCheckboxes[0].setCustomValidity(
            isInvalid ? 'Please select at least one type of disability.' : ''
        );
    }

    /**
     * RULE 2: When "Visual Impairment" is checked, the learner must also
     * specify either "Blind" or "Low Vision" (at least one of the two).
     */
    function validateVisualImpairmentSubtype() {
        if (!visualImpairmentCheckbox || !blindCheckbox || !lowVisionCheckbox) return;

        const needsSubtype = visualImpairmentCheckbox.checked && !visualImpairmentCheckbox.disabled;
        const subtypeChecked = blindCheckbox.checked || lowVisionCheckbox.checked;
        const isInvalid = needsSubtype && !subtypeChecked;

        blindCheckbox.setCustomValidity(
            isInvalid ? 'Please specify Blind or Low Vision.' : ''
        );
    }

    if (lwdYes && lwdNo) {
        lwdYes.addEventListener('change', toggleDisabilities);
        lwdNo.addEventListener('change', toggleDisabilities);
        toggleDisabilities(); // Run on load in case radio is pre-selected
    }

    // Re-validate both rules whenever any individual disability checkbox changes
    disabilityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            validateDisabilityGroup();
            validateVisualImpairmentSubtype();
        });
    });

    // ====================================================
    // 7. SAME AS CURRENT ADDRESS TOGGLE & AUTO-FILL
    // ====================================================
    const sameAddressYes = document.getElementById('same_address_yes');
    const sameAddressNo = document.getElementById('same_address_no');

    // Field mapping array: [Current ID, Permanent ID]
    const addressFields = [
        ['current_house_no', 'perm_house_no'],
        ['current_street_name', 'perm_street_name'],
        ['current_barangay', 'perm_barangay'],
        ['current_municipality_city', 'perm_municipality_city'],
        ['current_province', 'perm_province'],
        ['current_country', 'perm_country'],
        ['current_zip_code', 'perm_zip_code']
    ];

    function syncAddress() {
        if (!sameAddressYes) return;

        const isSame = sameAddressYes.checked;

        addressFields.forEach(([currId, permId]) => {
            const currInput = document.getElementById(currId);
            const permInput = document.getElementById(permId);

            if (currInput && permInput) {
                if (isSame) {
                    // Copy value and set to readonly
                    permInput.value = currInput.value;
                    permInput.readOnly = true;
                } else {
                    // Enable editing
                    permInput.readOnly = false;
                }
            }
        });
    }

    if (sameAddressYes && sameAddressNo) {
        sameAddressYes.addEventListener('change', syncAddress);

        sameAddressNo.addEventListener('change', function() {
            syncAddress();
            // Clear permanent fields when user switches back to 'No'
            addressFields.forEach(([_, permId]) => {
                const permInput = document.getElementById(permId);
                if (permInput) {
                    permInput.value = '';
                }
            });
        });

        // Real-time listener: updates permanent fields live if user types in Current Address while 'Yes' is selected
        addressFields.forEach(([currId, _]) => {
            const currInput = document.getElementById(currId);
            if (currInput) {
                currInput.addEventListener('input', function() {
                    if (sameAddressYes.checked) {
                        syncAddress();
                    }
                });
            }
        });

        // Run once on load in case 'Yes' is pre-selected
        syncAddress();
    }
});