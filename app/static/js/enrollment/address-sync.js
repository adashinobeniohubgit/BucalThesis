document.addEventListener('DOMContentLoaded', function () {

    // ====================================================
    // 7. SAME AS CURRENT ADDRESS TOGGLE & AUTO-FILL
    // ====================================================
    const sameAddressYes = document.getElementById('same_address_yes');
    const sameAddressNo = document.getElementById('same_address_no');

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
                    permInput.value = currInput.value;
                    permInput.readOnly = true;
                } else {
                    permInput.readOnly = false;
                }
            }
        });
    }

    if (sameAddressYes && sameAddressNo) {
        sameAddressYes.addEventListener('change', syncAddress);

        sameAddressNo.addEventListener('change', function() {
            syncAddress();
            addressFields.forEach(([_, permId]) => {
                const permInput = document.getElementById(permId);
                if (permInput) {
                    permInput.value = '';
                }
            });
        });

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

        syncAddress();
    }

});