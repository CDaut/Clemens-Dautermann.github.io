async function search(pPackageName) {

    //remove version declarations because the api cannot handle that
    let packageName = pPackageName.replace(/(>|>=|=).*/, '');

    //TODO: Once the bug is fixed, this should work without CORS Proxy
    const proxy = 'https://archviz-proxy.herokuapp.com/'

    //make the fetch request
    return fetch(
        //set the appropriate settings
        proxy + "https://archlinux.org/packages/search/json/?name=" + packageName, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        }
    )
        //make the response into json first
        .then(response => response.json())
        .then(json => {
            //set the error message to '' (because obviously something was found)
            document.getElementById('ErrorMessageBox').innerText = '';
            //return the dependencys
            const allDeps = new Set(json['results'][0]['depends'].values());


            //include optional dependencies if wanted
            if (document.getElementById('includeOptionalDepsCheckbox').checked) {
                //iterate over all optional dependencies
                for (const optionalDepWithComment of json['results'][0]['optdepends'].values()) {
                    //add them to all dependencies
                    allDeps.add(optionalDepWithComment.replace(/:\s.*/, ''));
                }
            }

            //include make dependencies if wanted
            if (document.getElementById('includeMakeDepsCheckbox').checked) {
                //add the make dependencys
                for (const makedep of json['results'][0]['optdepends'].values()) {
                    allDeps.add(makedep);
                }
            }

            return allDeps;
        })
        .catch(error => {
                //log the error
                console.error(`cannot resolve package ${packageName}`);
                //if this was the root package search, set the error message box
                if (packageName === document.getElementById('packageInput').value) {
                    document.getElementById('ErrorMessageBox').innerText =
                        `cannot resolve package "${packageName}"`;
                }
                //return an empty set so that iterating in the recursion will not break
                return new Set();
            }
        );
}

async function addSubteree(rootNode, graph, cache) {

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