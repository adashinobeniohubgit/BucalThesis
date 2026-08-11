document.addEventListener('DOMContentLoaded', function () {
    // ====================================================
    // 3. LRN REQUIRED TOGGLE (based on "With LRN?" question)
    // ====================================================
    const hasLrnYes = document.getElementById('has_lrn_yes');
    const hasLrnNo = document.getElementById('has_lrn_no');
    const lrnInput = document.getElementById('lrn_no');

    function toggleLrnRequired() {
        if (!hasLrnYes || !lrnInput) return;

        if (hasLrnYes.checked) {
            lrnInput.required = true;
        } else {
            lrnInput.required = false;
            lrnInput.value = '';
        }
    }

    if (hasLrnYes && hasLrnNo) {
        hasLrnYes.addEventListener('change', toggleLrnRequired);
        hasLrnNo.addEventListener('change', toggleLrnRequired);
        toggleLrnRequired();
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
            ipInput.disabled = false;
            ipInput.required = true;
        } else {
            ipInput.disabled = true;
            ipInput.required = false;
            ipInput.value = '';
        }
    }

    if (ipYes && ipNo) {
        ipYes.addEventListener('change', toggleIpSpecify);
        ipNo.addEventListener('change', toggleIpSpecify);
        toggleIpSpecify();
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
            fourPsInput.disabled = false;
            fourPsInput.required = true;
        } else {
            fourPsInput.disabled = true;
            fourPsInput.required = false;
            fourPsInput.value = '';
        }
    }

    if (fourPsYes && fourPsNo) {
        fourPsYes.addEventListener('change', toggle4psSpecify);
        fourPsNo.addEventListener('change', toggle4psSpecify);
        toggle4psSpecify();
    }

    // ====================================================
    // 6. LEARNER WITH DISABILITY (LWD) TOGGLE
    // ====================================================
    const lwdYes = document.getElementById('lwd_yes');
    const lwdNo = document.getElementById('lwd_no');
    const disabilityCheckboxes = document.querySelectorAll('input[name="disabilities"]');

    const visualImpairmentCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment"]');
    const blindCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment - Blind"]');
    const lowVisionCheckbox = document.querySelector('input[name="disabilities"][value="Visual Impairment - Low Vision"]');

    function toggleDisabilities() {
        if (!lwdYes || !disabilityCheckboxes.length) return;

        const isLwd = lwdYes.checked;

        disabilityCheckboxes.forEach(checkbox => {
            checkbox.disabled = !isLwd;

            if (!isLwd) {
                checkbox.checked = false;
            }
        });

        validateDisabilityGroup();
        validateVisualImpairmentSubtype();
    }

    function validateDisabilityGroup() {
        if (!lwdYes || !disabilityCheckboxes.length) return;

        const anyChecked = Array.from(disabilityCheckboxes).some(checkbox => checkbox.checked);
        const isInvalid = lwdYes.checked && !anyChecked;

        disabilityCheckboxes[0].setCustomValidity(
            isInvalid ? 'Please select at least one type of disability.' : ''
        );
    }

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
        toggleDisabilities();
    }

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

    const returningTextFieldIds = [
        'last_grade_completed',
        'last_school_attended',
        'school_id'
    ];
    const returningSelectFieldIds = [
        'last_school_year_completed'
    ];

    function toggleReturningFields() {
        if (!returningYes) return;

        const isReturning = returningYes.checked;

        returningTextFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            field.readOnly = !isReturning;
            field.required = isReturning;

            if (!isReturning) {
                field.value = '';
            }
        });

        returningSelectFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            field.disabled = !isReturning;
            field.required = isReturning;

            if (!isReturning) {
                field.value = '';
            }
        });
    }

    if (returningYes && returningNo) {
        returningYes.addEventListener('change', toggleReturningFields);
        returningNo.addEventListener('change', toggleReturningFields);
        toggleReturningFields();
    }
});