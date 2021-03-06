async function search(packageName) {

    const proxy = 'https://archviz-proxy.herokuapp.com/'

    return await fetch(
        proxy + "https://archlinux.org/packages/search/json/?name=" + packageName, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        }
    )
        .then(response => response.json())
        .then(json => {
            return json['results'][0]['depends'];
        })
        .catch(error =>
            console.error(error)
        );
}