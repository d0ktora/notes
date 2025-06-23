
document.addEventListener('DOMContentLoaded', () => {
    marked.setOptions({
        sanitize: false,
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

    const container = document.querySelector('.markdown-content');
    container.style.display = 'none';
    const raw = container.textContent; 
    container.innerHTML = marked.parse(raw); 
    
    for(const codeEl of document.querySelectorAll('pre code')){
        const className = codeEl.className || '';
        const langMatch = className.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : null;
        
        let result;
        
        if (lang && hljs.getLanguage(lang)) {
            result = hljs.highlight(codeEl.textContent, { language: lang });
        } else {
            result = hljs.highlightAuto(codeEl.textContent);
        }
        
        codeEl.innerHTML = result.value;
        
        const pre = codeEl.parentElement;
        const container = document.createElement('div');
        container.className = 'code-block-container';
        
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
        
        container.appendChild(header);
        container.appendChild(pre.cloneNode(true));
        
        pre.replaceWith(container);
    };
    setTimeout(() => {    container.style.display = 'flex';}, 50);

});
