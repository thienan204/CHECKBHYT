export const copyToClipboard = (text: string): Promise<void> => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for non-HTTPS environments (like local network IPs)
        return new Promise((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Move it off-screen to avoid visual scrolling glitch
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Fallback copy failed!'));
                }
            } catch (err) {
                reject(err);
            } finally {
                textArea.remove();
            }
        });
    }
};
