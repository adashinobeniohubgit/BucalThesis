document.addEventListener('DOMContentLoaded', function () {

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