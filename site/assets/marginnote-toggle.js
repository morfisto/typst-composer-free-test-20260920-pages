/**
 * Adds mobile-only toggles for margin notes and footnotes so they can expand
 * inline without changing the desktop reading layout.
 */
(() => {
	const settings = window.ComposerBlogSettings?.notes ?? {};
	const mobileQuery = window.matchMedia("(max-width: 760px)");

	function init() {
		if (document.documentElement.dataset.notesReady) return;document.documentElement.dataset.notesReady='true';
		const registry = new Map();

		// Keep only one expanded note open at a time on small screens.
		function closeAll(exceptId) {
			registry.forEach(({ note, toggle }, id) => {
				if (id === exceptId) return;
				note.classList.remove("is-expanded");
				toggle.classList.remove("is-expanded");
				toggle.setAttribute("aria-expanded", "false");
			});
		}

		function expandNote(note, toggle) {
			note.classList.add("is-expanded");
			toggle.classList.add("is-expanded");
			toggle.setAttribute("aria-expanded", "true");
			note.scrollIntoView({ block: "nearest", behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth' });
		}

		function collapseNote(note, toggle) {
			note.classList.remove("is-expanded");
			toggle.classList.remove("is-expanded");
			toggle.setAttribute("aria-expanded", "false");
		}

		function handleToggle(event) {
			if (!mobileQuery.matches) {
				return;
			}

			event.preventDefault();

			const targetId = event.currentTarget.dataset.marginnoteTarget;
			const entry = registry.get(targetId);
			if (!entry) return;

			const { note, toggle } = entry;
			const willOpen = !note.classList.contains("is-expanded");

			if (willOpen) {
				if (settings.exclusive !== false) closeAll(targetId);
				expandNote(note, toggle);
			} else {
				collapseNote(note, toggle);
			}
		}

		function registerToggle(toggle, note) {
			if (!toggle || !note) return;

			toggle.dataset.marginnoteTarget = note.id;
			registry.set(note.id, { note, toggle });
			toggle.addEventListener("click", handleToggle);
		}

		function setupFootnoteToggles() {
			const footnoteLinks = document.querySelectorAll(
				"sup.footnote-ref > a.footnote-ref-link",
			);

			footnoteLinks.forEach((link) => {
				const href = link.getAttribute("href") || "";
				if (!href.startsWith("#")) return;

				let targetId;try{targetId=decodeURIComponent(href.slice(1));}catch{return;}
				const note = document.getElementById(targetId);
				if (!note) return;

				link.classList.add("marginnote-toggle");
				link.setAttribute("aria-controls", targetId);
				link.setAttribute("aria-expanded", "false");

				registerToggle(link, note);
			});
		}

		function openFromHash() {
			if (!mobileQuery.matches) return;

			const hash = window.location.hash;
			if (!hash) return;

			let targetId;try{targetId=decodeURIComponent(hash.slice(1));}catch{return;}
			const entry = registry.get(targetId);
			if (!entry) return;

			if (settings.exclusive !== false) closeAll(targetId);
			expandNote(entry.note, entry.toggle);
		}

		setupFootnoteToggles();
		document.querySelectorAll('.marginnote').forEach((note,index)=>{
			if (note.id && registry.has(note.id)) return;
			if (!note.id) {let id='margin-note-'+index;while(document.getElementById(id))id+='-';note.id=id;}
			const marker=document.createElement('sup'),toggle=document.createElement('button');marker.className='marginnote-ref';toggle.type='button';toggle.className='marginnote-toggle';toggle.textContent='旁注';toggle.setAttribute('aria-controls',note.id);toggle.setAttribute('aria-expanded','false');marker.append(toggle);note.before(marker);registerToggle(toggle,note);
		});
        const updateMode=()=>{
            registry.forEach(({note,toggle})=>collapseNote(note,toggle));
            if(settings.mobileOpen&&mobileQuery.matches){let opened=false;registry.forEach(({note,toggle})=>{if(!opened||settings.exclusive===false){note.classList.add('is-expanded');toggle.classList.add('is-expanded');toggle.setAttribute('aria-expanded','true');opened=true;}});}
            openFromHash();
        };
        updateMode();
        window.addEventListener('hashchange',openFromHash);
        mobileQuery.addEventListener('change',updateMode);

	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
