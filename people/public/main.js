const search = document.querySelector('#search-button');

if (search) {
    search.addEventListener('click', _ => {
        const query = document.querySelector('#query').value;
        const queryString = '/movies/?movie=' + query;

        fetch(queryString)
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(response => {
            $("#searchresults").empty();
            response.forEach(element => {
                const a = $("<a>")
                    .text(element.title)
                    .attr("href", "/tt/" + element.tt);
                $("<li>").append(a).appendTo("#searchresults");
            });
        })
        .catch(console.error);
    });
}

// two questions by end of april 
// ajax updating ratings
// is there a role for async and await in this app? 