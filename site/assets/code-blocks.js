/**
 * Enhances rendered code blocks with line numbers and a copy button.
 */
document.addEventListener("DOMContentLoaded", () => {
	const settings = window.ComposerBlogSettings?.code ?? {};
	const codeBlocks = document.querySelectorAll("pre > code");

	codeBlocks.forEach((codeBlock) => {
		const pre = codeBlock.parentElement;

		// ========== Add line numbers ==========
		// Check if already processed
		if (settings.lineNumbers !== false && !pre.querySelector(".line-numbers-rows")) {
			// Clone to count lines correctly handling <br>
			const clone = codeBlock.cloneNode(true);
			const brs = clone.querySelectorAll("br");
			brs.forEach((br) => {
				br.replaceWith("\n");
			});

			const text = clone.textContent;
			// Remove trailing newline if it exists to avoid extra line number
			const cleanText = text.replace(/\n$/, "");
			const lineCount = cleanText.split(/\r\n|\r|\n/).length;

			// Create line numbers container
			const rows = document.createElement("span");
			rows.className = "line-numbers-rows";

			for (let i = 1; i <= lineCount; i++) {
				const span = document.createElement("span");
				span.textContent = i;
				rows.appendChild(span);
			}

			// Insert before code block
			pre.insertBefore(rows, codeBlock);
			pre.classList.add("has-line-numbers");
		}

		// ========== Add copy button ==========
		// Check if copy button already exists
		if (settings.copy === false || pre.querySelector(".copy-button")) return;

		// Create the copy button
		const copyButton = document.createElement("button");
		copyButton.className = "copy-button";
		copyButton.type = 'button';copyButton.setAttribute('aria-live','polite');
		copyButton.textContent = settings.label ?? "Copy";

		// Add click event listener
		copyButton.addEventListener("click", () => {
			// Clone the code block to handle <br> tags correctly
			const clone = codeBlock.cloneNode(true);

			// Replace <br> tags with newlines
			const brs = clone.querySelectorAll("br");
			brs.forEach((br) => {
				br.replaceWith("\n");
			});

			// Get text content (now with newlines)
			const codeText = clone.textContent;

			Promise.resolve().then(()=>{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');return navigator.clipboard.writeText(codeText);})
				.then(() => {
					// Success feedback
					const originalText = copyButton.textContent;
					copyButton.textContent = settings.success ?? "Copied!";
					copyButton.classList.add("copied");

					setTimeout(() => {
						copyButton.textContent = originalText;
						copyButton.classList.remove("copied");
					}, 2000);
				})
				.catch((err) => {
					console.error("Failed to copy text: ", err);
					copyButton.textContent = settings.failure ?? "复制失败，请选择文本复制";
				});
		});

		// Make sure pre is positioned relatively so we can absolute position the button
		pre.style.position = "relative";

		// Append button to pre
		pre.appendChild(copyButton);
	});
});
