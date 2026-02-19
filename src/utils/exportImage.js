import html2canvas from 'html2canvas';

/**
 * Export a DOM element as an image (PNG)
 * @param {HTMLElement} element - The DOM element to export
 * @param {string} filename - The filename for the downloaded image
 * @param {Object} options - Additional options for customization
 */
export async function exportToImage(element, filename = 'export.png', options = {}) {
    if (!element) {
        console.error('No element provided for export');
        return;
    }

    const {
        backgroundColor = '#0a0a0a',
        padding = 20,
        scale = 2,
        onStart = () => { },
        onClone = () => { }, // Callback to modify the clone before export
        onComplete = () => { },
        onError = () => { }
    } = options;

    try {
        onStart();

        // Create a wrapper to add padding
        const wrapper = document.createElement('div');
        wrapper.style.padding = `${padding}px`;
        wrapper.style.backgroundColor = backgroundColor;
        wrapper.style.display = 'inline-block';

        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);

        // Remove sticky positioning for proper rendering
        const stickyElements = clone.querySelectorAll('[class*="sticky"]');
        stickyElements.forEach(el => {
            el.style.position = 'relative';
        });

        // Add specific export class to clone
        clone.classList.add('export-mode');

        // Allow modification of the clone
        if (onClone) {
            onClone(clone);
        }

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, {
            backgroundColor,
            scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: element.scrollWidth + padding * 2,
            windowHeight: element.scrollHeight + padding * 2,
        });

        // Remove wrapper from DOM
        document.body.removeChild(wrapper);

        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                onComplete();
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error exporting image:', error);
        onError(error);
    }
}

/**
 * Export standings table to image
 * @param {HTMLElement} tableRef - Reference to the standings table element
 * @param {string} tournamentName - Name of the tournament for the filename
 */
export async function exportStandingsToImage(tableRef, tournamentName = 'tournament') {
    const sanitizedName = tournamentName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `klasemen_${sanitizedName}_${Date.now()}.png`;

    return exportToImage(tableRef, filename, {
        backgroundColor: '#0a0a0a',
        padding: 30,
    });
}

/**
 * Export bracket to image
 * @param {HTMLElement} bracketRef - Reference to the bracket element
 * @param {string} tournamentName - Name of the tournament for the filename
 */
export async function exportBracketToImage(bracketRef, tournamentName = 'tournament') {
    const sanitizedName = tournamentName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `bracket_${sanitizedName}_${Date.now()}.png`;

    return exportToImage(bracketRef, filename, {
        backgroundColor: '#0a0a0a',
        padding: 40,
        scale: 2,
    });
}

/**
 * Export top scorers to image (Top 10 only)
 * @param {HTMLElement} element - Reference to the top scorers element
 * @param {string} tournamentName - Name of the tournament
 */
export async function exportTopScorersToImage(element, tournamentName = 'tournament') {
    const sanitizedName = tournamentName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `top_scorers_${sanitizedName}_${Date.now()}.png`;

    return exportToImage(element, filename, {
        backgroundColor: '#0a0a0a',
        padding: 40,
        scale: 2,
        onClone: (clone) => {
            // Find the table body
            const tbody = clone.querySelector('tbody');
            if (tbody) {
                // Get all rows
                const rows = Array.from(tbody.querySelectorAll('tr'));
                // Remove rows after index 9 (keep top 10)
                if (rows.length > 10) {
                    for (let i = 10; i < rows.length; i++) {
                        rows[i].remove();
                    }
                }
            }
        }
    });
}

/**
 * Export group stage to image
 * @param {HTMLElement} element - Reference to the group stage element
 * @param {string} tournamentName - Name of the tournament
 */
export async function exportGroupStageToImage(element, tournamentName = 'tournament') {
    const sanitizedName = tournamentName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `group_stage_${sanitizedName}_${Date.now()}.png`;

    return exportToImage(element, filename, {
        backgroundColor: '#0a0a0a',
        padding: 30,
        scale: 2
    });
}
