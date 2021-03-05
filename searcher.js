function search() {

    const packageName = document.getElementById('packageInput').value;

    //define repositorys to search
    var repositorys = ['community', 'community-testing', 'core', 'extra', 'testing'];

    const Http = new XMLHttpRequest();
    const urlPattern = 'https://archlinux.org/packages/search/json'

    for (const i in repositorys) {
        const repo = repositorys[i];

        Http.open('GET', urlPattern, true);

        Http.setRequestHeader('Access-Control-Allow-Origin', '*');
        Http.setRequestHeader('Access-Control-Allow-Headers', '*');
        Http.setRequestHeader('Content-Type', 'application/json');

        Http.onreadystatechange = (ev) => {

            if (this.readyState === 4 && this.status === 400) {
                console.log(`package ${packageName} not found.`)
            } else if (this.readyState === 4 && this.status === 200) {
                console.log(`package ${packageName} found in repository ${repo}.`)
            }
        }
        Http.send(JSON.stringify({name: packageName}));
    }
}