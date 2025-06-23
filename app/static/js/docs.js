

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll("ul > li button").forEach(x => {
        x.addEventListener('click', async () => {
            let deleteUrl = x.previousElementSibling.href
            deleteUrl = deleteUrl.replace("edit", "delete");
            const res = await fetch(deleteUrl, {
                method: 'POST'
            })
            if(res.status === 200){
                window.location.reload()
            } else {
                console.error("Failed deleting :",deleteUrl)
            }
        })
    })

    document.querySelector('.select').addEventListener('click', e => {
        let btn = e.target
        btn.classList.toggle("active")
    });

    document.querySelector('.document-list').addEventListener('click', e => {
        let el = e.target;

        if(!el.classList.contains("document") && !(el.closest(".document") ?? false))
            return;

        if(document.querySelector('.select').classList.contains('active')){
            el.classList.toggle('selected')
            e.preventDefault()
            e.stopPropagation()
        }
    })

    document.querySelector('.select-all').addEventListener('click', () => {
        x = document.querySelectorAll('.document:not(.selected)');
        if(x.length < 1){
            document.querySelectorAll('.document').forEach(x => x.classList.remove('selected'));
        } else {
            document.querySelectorAll('.document').forEach(x => x.classList.add('selected'));
        }
    })

    document.querySelector('.delete-selected').addEventListener('click', async () => {
        const deleteUrls = Array.from(document.querySelectorAll('.document.selected .edit')).map(x => 
            x.href.replace("edit", "delete")
        );
        
        const deleteRequests = deleteUrls.map(url =>
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({})
            }).then(res => {
                if (!res.ok) throw new Error(`Failed to delete: ${url}`);
                return true;
            })
        );

        try {
            await Promise.all(deleteRequests);
            window.location.reload();
        } catch (err) {
            console.error('One or more deletions failed:', err);
        }
    })


    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    const filterDocuments = () => {
        const query = document.querySelector('.filter').value.trim().toLowerCase();
        const items = document.querySelectorAll('.document-list .document');

        items.forEach(item => {
            const textContent = item.innerText.toLowerCase();
            const matches = textContent.includes(query);

            if (matches || query === '') {
                item.classList.remove('filtered');
            } else {
                item.classList.add('filtered');
            }
        });
    };

    const debouncedFilter = debounce(filterDocuments, 500);
    document.querySelector('.filter').addEventListener('keyup', debouncedFilter);

});
