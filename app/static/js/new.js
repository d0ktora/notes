function highlightCodeBlocks() {
  document.querySelectorAll('pre code').forEach((codeEl) => {
    const className = codeEl.className || '';
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : null;

    let result;

    if (lang && hljs.getLanguage(lang)) {
      // Use the explicitly specified language
      result = hljs.highlight(codeEl.textContent, { language: lang });
    } else {
      // Fallback to auto-detection
      result = hljs.highlightAuto(codeEl.textContent);
    }

    codeEl.innerHTML = result.value;

    // Wrap in a container
    const pre = codeEl.parentElement;
    const container = document.createElement('div');
    container.className = 'code-block-container';

    // Create header
    const header = document.createElement('div');
    header.className = 'code-header';

    const langLabel = document.createElement('span');
    langLabel.className = 'lang-label';
    langLabel.textContent = lang || result.language || 'Plain text';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(codeEl.textContent.trimEnd("\n"));
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    };

    header.appendChild(langLabel);
    header.appendChild(copyBtn);

    // Build the new structure
    container.appendChild(header);
    container.appendChild(pre.cloneNode(true));

    // Replace original
    pre.replaceWith(container);
  });
}



document.addEventListener('DOMContentLoaded', () => {
    const tagsInitial = document.querySelectorAll('.tag');
    const finishBtn = document.querySelector('#finish');
    finishBtn.classList.add(tagsInitial.length > 0 ? 'enabled' : 'disabled');

    const tags = document.querySelector('.tags');
    const taglist = tags.querySelector('#taglist')
    tagsInitial.forEach(t => {
        t.tagFinalize = () => {
            if(t.classList.contains('done')) return;
            const i = t.querySelector('input');
            const p = document.createElement('p');
            if(i.value.trim() === '') {
                taglist.removeChild(t);
            }
            p.innerText = i.value.trim();
            t.removeChild(i);
            t.appendChild(p);
            t.classList.add('done');
        }
        t.tagEdit = () => {
            const i = document.createElement('input');
            const p = t.querySelector('p');
            i.value = p.innerText;
            i.addEventListener('keydown', (e) => {
                if(e.key === 'Enter'){
                    e.preventDefault();
                    if(i.value.trim() !== '') tags.click();
                    t.tagFinalize()
                }
                if(e.key === 'Escape'){
                    i.value = '';
                    t.tagFinalize();
                    if(taglist.querySelectorAll('.tag').length === 0)
                        finishBtn.classList.add('disabled');
                }

            });
            t.removeChild(t.querySelector('p'));
            t.appendChild(i);
            t.classList.remove('done');
            i.focus();
        };
    })
    window.addEventListener('click', (e) => {
        let targetIsTag = false;
        if(taglist.querySelectorAll('.tag').length > 0)
            finishBtn.classList.remove('disabled');
        else
            finishBtn.classList.add('disabled');
        for(const t of taglist.querySelectorAll('.tag')){
            if(e.target !== t && e.target.closest('.tag') !== t){
                t.tagFinalize();
            } else {
                targetIsTag = true;
                if(t.classList.contains('done')){
                    t.tagEdit();
                }
            }
        };
        if(e.target !== tags && e.target.closest('.tags') !== tags) return;
        if(targetIsTag) return;

        e.stopPropagation();
        e.preventDefault();

        const x = document.createElement('li');
        x.className = 'tag';
        const input = document.createElement('input');
        input.type = 'text';
        x.appendChild(input);
        taglist.appendChild(x);
        input.focus();

        x.tagFinalize = () => {
            if(x.classList.contains('done')) return;
            const i = x.querySelector('input');
            const p = document.createElement('p');
            if(i.value.trim() === '') {
                taglist.removeChild(x);
            }
            p.innerText = i.value.trim();
            x.removeChild(i);
            x.appendChild(p);
            x.classList.add('done');
        }
        x.tagEdit = () => {
            const i = document.createElement('input');
            const p = x.querySelector('p');
            i.value = p.innerText;
            i.addEventListener('keydown', (e) => {
                if(e.key === 'Enter'){
                    e.preventDefault();
                    if(i.value.trim() !== '') tags.click();
                    x.tagFinalize()
                }
                if(e.key === 'Escape'){
                    i.value = '';
                    x.tagFinalize();
                    if(taglist.querySelectorAll('.tag').length === 0)
                        finishBtn.classList.add('disabled');
                }

            });
            x.removeChild(x.querySelector('p'));
            x.appendChild(i);
            x.classList.remove('done');
            i.focus();
        };

        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter'){
                e.preventDefault();
                if(input.value.trim() !== '') tags.click();
                x.tagFinalize()
            }
            if(e.key === 'Escape'){
                input.value = '';
                x.tagFinalize();
                if(taglist.querySelectorAll('.tag').length === 0)
                    finishBtn.classList.add('disabled');
            }
        });
    });

    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    let isPreview = false;

    marked.setOptions({
        breaks: true,
        gfm:true,
        highlight: function(code, lang) {
            if (hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'language-'
    });

    function updatePreview() {
      const rawMarkdown = editor.value;
      preview.innerHTML = marked.parse(rawMarkdown);
    }

    const btnEdit = document.querySelector('.display header button:first-of-type');
    const btnPreview = document.querySelector('.display header button:nth-of-type(2)');
    function toggleMode() {
      isPreview = !isPreview;
      if (isPreview) {
            btnEdit.classList.remove('active');
            btnPreview.classList.add('active');
        updatePreview();
        editor.style.display = 'none';
        preview.style.display = 'flex';
            highlightCodeBlocks();
      } else {
            btnEdit.classList.add('active');
            btnPreview.classList.remove('active');
        editor.style.display = 'inline-block';
            editor.focus();
        preview.style.display = 'none';
      }
    }

    btnEdit.addEventListener('click', () => {
        isPreview = false;
        btnEdit.classList.add('active');
        btnPreview.classList.remove('active');
        editor.style.display = 'inline-block';
        editor.focus();
        preview.style.display = 'none';

    });
    btnPreview.addEventListener('click', () => {
        isPreview = true;
        btnEdit.classList.remove('active');
        btnPreview.classList.add('active');
        updatePreview();
        editor.style.display = 'none';
        preview.style.display = 'flex';
        highlightCodeBlocks();

    });

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleMode();
      }
    });

    editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();

      const start = this.selectionStart;
      const end = this.selectionEnd;

      // Insert tab character at the cursor
      this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);

      // Move cursor after the tab
      this.selectionStart = this.selectionEnd = start + 1;
    }});

    finishBtn.onclick = async () => {
        const data = {
            tags: [],
            title: null,
            content: null
        }
        for(const t of taglist.querySelectorAll('.tag')){
            if(t.textContent.trim() !== '')
                data.tags.push(t.textContent.trim());
        }
        data.tags = data.tags.join(', ');
        const md = document.querySelector('#editor').value.trim();
        if(md.length < 2)
            console.log('ne stava');
        const match = md.match(/^# (.+)/m);
        if(!match)
            console.log('ne stava');
        data.title = match[1].trim();
        data.content = md;
        const res = await fetch('/submit', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        })
        const result = await res.json();
        if(result.status === 'success'){
            window.location.href = '/';
        } else {
            console.log('ne stava');
        }
    }

});
