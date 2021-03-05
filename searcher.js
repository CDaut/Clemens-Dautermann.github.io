function search() {

    const packageName = document.getElementById('packageInput').value;
    const proxy = 'https://cors-anywhere.herokuapp.com/'
    fetch(
        proxy + "https://archlinux.org/packages/search/json/?name=pandoc", {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        }
    )
        .then(response => response.json())
        .then(json => console.log(json['results'][0]['url']))
        .catch(error =>
            console.error(error)
        );
}