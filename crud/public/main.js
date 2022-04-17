const update = document.querySelector('#update-button');

if (update) {
    update.addEventListener('click', _ => {
        fetch('/quotes', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'scott',
                quote: 'BIG fan of frogs'
            })
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(response => {
            window.location.reload(true);
        })
    })
}

const deleteButton = document.querySelector('#delete-button');

if (deleteButton) {
    deleteButton.addEventListener('click', _ => {
        fetch('/quotes', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'scott'
            })
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(response => {
            if (response === 'No quotes to delete...') {
                message.textContent = 'No remaining quotes from Scott to delete...';
            } else {
                window.location.reload(true);
            }
        })
        .catch(console.error);
    })
}

const search = document.querySelector('#search-button');

if (search) {
    search.addEventListener('click', _ => {
        const query = document.querySelector('#query').value;
        // library to properly encode urls
        const queryString = '/quotes/?quote=' + query;
    
        fetch(queryString)
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(response => {
            $("#searchResults").empty();
            response.forEach(element => {
                const a = $("<a>")
                    .text(element.name + ": " + element.quote)
                    .attr("href", "/quoteid/" + element._id);
                $("<li>").append(a).appendTo("#searchResults");
            });
            // ultimately, an array of objects -> hyperlinks
            // foreach, generate url (in frontend!), add to page
        })
        .catch(console.error);
    })
}

const updatebtn = document.getElementById('updateQuote');
if (updatebtn) {
    updatebtn.addEventListener('click', function(event){
        //event.preventDefault();
        fetch('/quotes', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: document.getElementById('qid').value,
                author: document.getElementById('author').value,
                quote: document.getElementById('quote').value
            })
        })
        .then(function(res){
            if (res.ok) return res.json();
        })
        .then(response => {
            window.location.reload(true);
        })
    })
}