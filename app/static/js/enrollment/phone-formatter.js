document.addEventListener('DOMContentLoaded', function () {

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

});