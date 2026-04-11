/**
 * Dynamic nested Table of Contents generator
 * Scans .post-body for h2, h3, h4 headings and builds nested structure
 * Replaces any existing .ct-toc-list with nested version
 */

function generateNestedTOC() {
  const postBody = document.querySelector('.post-body');
  if (!postBody) return;

  // Find all headings h2, h3, h4 with IDs
  const headings = Array.from(postBody.querySelectorAll('h2[id], h3[id], h4[id]'));
  
  if (headings.length === 0) {
    console.warn('No headings with IDs found in .post-body');
    return;
  }

  // Build nested structure
  const root = [];
  let h2Ref = null;
  let h3Ref = null;

  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]); // 2, 3, or 4
    const id = heading.id;
    const text = heading.textContent.trim();
    
    // Escape special characters for safe HTML/JSON output
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const item = {
      id,
      text: escapedText,
      level,
      children: []
    };

    if (level === 2) {
      root.push(item);
      h2Ref = item;
      h3Ref = null;
    } else if (level === 3) {
      if (h2Ref) {
        h2Ref.children.push(item);
        h3Ref = item;
      } else {
        root.push(item);
        h3Ref = item;
      }
    } else if (level === 4) {
      if (h3Ref) {
        h3Ref.children.push(item);
      } else if (h2Ref) {
        h2Ref.children.push(item);
      } else {
        root.push(item);
      }
    }
  });

  // Build HTML from nested structure
  function buildHTML(items, level = 2) {
    if (items.length === 0) return '';

    let html = `<ol class="ct-toc-list ct-toc-level-${level}">`;
    items.forEach(item => {
      html += `<li>`;
      // item.text is already HTML-escaped
      html += `<a href="#${item.id}">${item.text}</a>`;
      if (item.children.length > 0) {
        html += buildHTML(item.children, level + 1);
      }
      html += `</li>`;
    });
    html += `</ol>`;
    return html;
  }

  const newTOC = buildHTML(root);

  // Replace existing ToC or create new one
  const tocContainer = document.querySelector('.ct-toc');
  if (tocContainer) {
    const label = tocContainer.querySelector('.ct-toc-label');
    const oldList = tocContainer.querySelector('.ct-toc-list');
    if (oldList) {
      oldList.replaceWith(newTOC === '<ol class="ct-toc-list ct-toc-level-2"></ol>' ? oldList : createElementFromHTML(newTOC));
    } else {
      tocContainer.insertAdjacentHTML('beforeend', newTOC);
    }
  }
}

function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  try {
    div.innerHTML = htmlString.trim();
  } catch (e) {
    console.error('Failed to create ToC HTML:', e);
    return null;
  }
  return div.firstChild;
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', generateNestedTOC);
} else {
  generateNestedTOC();
}

// Highlight active link as user scrolls and scroll ToC to keep it visible
function highlightActiveTOCLink() {
  const links = document.querySelectorAll('.ct-toc-list a');
  const headings = Array.from(document.querySelectorAll('.post-body h2[id], .post-body h3[id], .post-body h4[id]'));
  const tocContainer = document.querySelector('.ct-toc');

  const callback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.ct-toc-list a[href="#${entry.target.id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
          
          // Scroll the active link into view within the ToC container
          if (activeLink && tocContainer) {
            try {
              activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (e) {
              // Fallback: silent fail
            }
          }
        }
      }
    });
  };

  const observer = new IntersectionObserver(callback, { threshold: 0.3 });
  headings.forEach(h => observer.observe(h));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlightActiveTOCLink);
} else {
  highlightActiveTOCLink();
}
