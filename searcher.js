function search(packageName) {

    const proxy = 'https://archviz-proxy.herokuapp.com/'

    return fetch(
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
            return new Set(json['results'][0]['depends'].values());
        })
        .catch(error => {
                console.error(`cannot resolve package ${packageName}`);
                return new Set();
            }
        );
}

function addSubteree(rootNode, graph, cache) {

    //retrieve all dependencies of a package using the serch function
    search(rootNode).then((dependencies) => {

        //iterate over all those dependencies
        for (const dependency of dependencies) {

            //check if the dependency is cached (if the subtree has already been drawn for it
            if (!cache.has(dependency)) {
                //add a link from the rootnode to that dependency
                graph.addLink(rootNode, dependency);

                //initiate recursive call to build subtree for that dependency
                addSubteree(
                    dependency,
                    graph,
                    cache
                );

                //add the dependency to the cache so that in the next loop iteration it will not be handled again
                cache.add(dependency);
            }
        }
    });
}