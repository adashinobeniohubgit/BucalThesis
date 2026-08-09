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
    // ====================================================
    // 8. PHONE NUMBER AUTOMATIC FORMATTING (09XX-XXX-XXXX)
    // ====================================================
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Strip non-numeric and cap at 11 raw digits
            let raw = e.target.value.replace(/\D/g, '').substring(0, 11);
            
            // Formats as 0917-123-4567
            if (raw.length > 7) {
                e.target.value = `${raw.slice(0, 4)}-${raw.slice(4, 7)}-${raw.slice(7)}`;
            } else if (raw.length > 4) {
                e.target.value = `${raw.slice(0, 4)}-${raw.slice(4)}`;
            } else {
                e.target.value = raw;
            }
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
    // ====================================================
    // 10. SIGNATURE MODAL & CANVAS DRAWING LOGIC
    // (Supports XP-Pen Tablet, Mouse, and Mobile Touch via Pointer Events)
    // ====================================================
    const openSigBtn = document.getElementById('open_sig_modal_btn');
    const sigModal = document.getElementById('sig_modal');
    const cancelSigBtn = document.getElementById('cancel_sig_btn');
    const clearSigBtn = document.getElementById('clear_sig_btn');
    const saveSigBtn = document.getElementById('save_sig_btn');
    const canvas = document.getElementById('sig_canvas');
    const sigInput = document.getElementById('signature_data');
    const sigPreview = document.getElementById('signature_preview');

    if (canvas && openSigBtn) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // Reset brush properties
        function resetCanvasContext() {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        // Open & Close Modal
        openSigBtn.addEventListener('click', () => {
            sigModal.style.display = 'flex';
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing
            resetCanvasContext();
        });

        if (cancelSigBtn) {
            cancelSigBtn.addEventListener('click', () => sigModal.style.display = 'none');
        }

        if (clearSigBtn) {
            clearSigBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                resetCanvasContext();
            });
        }

        // Accurately calculates coordinates even if canvas is scaled via CSS
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }

        // Pointer Events (Handles Pen/Stylus, Mouse, and Touch)
        canvas.addEventListener('pointerdown', (e) => {
            isDrawing = true;
            canvas.setPointerCapture(e.pointerId); // Tracks drawing even if cursor briefly slips outside canvas
            ctx.beginPath();
            const p = getPos(e);
            ctx.moveTo(p.x, p.y);
        });

        canvas.addEventListener('pointermove', (e) => {
            if (isDrawing) {
                const p = getPos(e);

                // Optional pressure sensitivity support for XP-Pen
                if (e.pointerType === 'pen' && e.pressure) {
                    ctx.lineWidth = Math.max(1, e.pressure * 5);
                }

                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            isDrawing = false;
            canvas.releasePointerCapture(e.pointerId);
        });

        // Save Signature as Base64 Image string
        if (saveSigBtn) {
            saveSigBtn.addEventListener('click', () => {
                const dataUrl = canvas.toDataURL('image/png');
                if (sigInput) sigInput.value = dataUrl; // Store in hidden input for PHP submit

                // Update Preview in Main Form
                if (sigPreview) {
                    sigPreview.innerHTML = `<img src="${dataUrl}" alt="Signature Preview" style="max-width:100%; height:auto;" />`;
                }
                openSigBtn.textContent = 'Change Signature';

                sigModal.style.display = 'none';
            });
        }
    }
});