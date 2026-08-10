document.addEventListener('DOMContentLoaded', function () {
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
    // 9. RETURNING LEARNER (BALIK-ARAL) FIELDS TOGGLE
    // ====================================================
    const returningYes = document.getElementById('returning_yes');
    const returningNo = document.getElementById('returning_no');

    // Text/number inputs use `readonly`; the <select> uses `disabled`
    // since `readonly` has no effect on <select> elements in HTML.
    const returningTextFieldIds = [
        'last_grade_completed',
        'last_school_attended',
        'school_id'
    ];
    const returningSelectFieldIds = [
        'last_school_year_completed'
    ];

    /**
     * Toggles the returning-learner fields between editable/required
     * and readonly/optional based on the "Returning (Balik-Aral)" answer.
     *
     * - "Yes" -> fields become editable and required
     * - "No"  -> fields become readonly/disabled, cleared, and optional
     */
    function toggleReturningFields() {
        if (!returningYes) return;

        const isReturning = returningYes.checked;

        returningTextFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            field.readOnly = !isReturning;
            field.required = isReturning;

            if (!isReturning) {
                field.value = ''; // Clear stale input if user switches back to 'No'
            }
        });

        returningSelectFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            field.disabled = !isReturning;
            field.required = isReturning;

            if (!isReturning) {
                field.value = ''; // Reset to placeholder if user switches back to 'No'
            }
        });
    }

    if (returningYes && returningNo) {
        returningYes.addEventListener('change', toggleReturningFields);
        returningNo.addEventListener('change', toggleReturningFields);
        toggleReturningFields(); // Run on load in case pre-selected
    }
});