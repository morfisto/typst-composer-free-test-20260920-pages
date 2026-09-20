/**
 * Shows a floating back-to-top button after the user scrolls down and
 * scrolls the page back to the top with smooth behavior when clicked.
 */
(() => {
	const settings = window.ComposerBlogSettings?.backTop ?? {};
	if (settings.enabled === false) return;
	const SHOW_AFTER = settings.threshold ?? 300;

	function createButton() {
		const button = document.createElement("button");
		button.id = "page-jump-btn";
		button.className = "page-jump-btn";
		button.type = "button";
		button.setAttribute("aria-label", settings.label ?? "返回顶部");
		button.innerHTML =
			'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>';

		button.addEventListener("click", () => {
			window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth' });
		});

		return button;
	}

	function init() {
		if (document.getElementById('page-jump-btn')) return;
		const button = createButton();
		document.body.appendChild(button);

		// Keep the button hidden near the top of the page.
		function updateVisibility() {
			button.classList.toggle("is-visible", window.scrollY > SHOW_AFTER);
		}

		updateVisibility();
		window.addEventListener("scroll", updateVisibility, { passive: true });
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
