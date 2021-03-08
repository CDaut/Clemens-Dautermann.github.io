async function getNodeJSON(pPackageName) {

    //this table contains manual mapping for packages that are provided by packages
    //that have another name (fore some reason)
    let manualLookupTable = {
        'initramfs': 'mkinitcpio',
        'sh': 'bash',
        'awk': 'gawk',
        'udev': 'systemd',
        'libltdl': 'libtool',
        'libjpeg': 'libjpeg-turbo',
        'opengl-driver': 'mesa'
    }

    //remove version declarations and comments because the api cannot handle that
    let packageName = pPackageName.replace(/(>|>=|=).*/, '').replace(/:\s.*/, '');

    //redefine the package name using manual lookups if necerssary
    if (typeof manualLookupTable[packageName] !== 'undefined')
        packageName = manualLookupTable[packageName];

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
            //try to get the dependencies trigger an error if they are absent
            if (typeof json['results'][0]['depends'].values() === "undefined") throw Error;

            return json['results'][0];
        })
        .catch(() => {
            //log the error
            console.error(`cannot resolve package ${packageName}`);
            //if this was the root package search, set the error message box
            if (packageName === document.getElementById('packageInput').value) {
                document.getElementById('ErrorMessageBox').innerText =
                    `cannot resolve package "${packageName}"`;
            }
            //return an empty set so that iterating in the recursion will not break
            return new Set();
        });
}

function getDepsFromJSON(json) {
    //set the error message to '' (because obviously something was found)
    document.getElementById('ErrorMessageBox').innerText = '';

    //check if the json is valid
    if (typeof json['depends'] === 'undefined') return new Set();

    //return the dependencys
    const allDeps = new Set(json['depends'].values());


    //include optional dependencies if wanted
    if (document.getElementById('includeOptionalDepsCheckbox').checked) {
        //iterate over all optional dependencies
        for (const optionalDepWithComment of json['optdepends'].values()) {
            //add them to all dependencies
            allDeps.add(optionalDepWithComment.replace(/:\s.*/, ''));
        }
    }

    //include make dependencies if wanted
    if (document.getElementById('includeMakeDepsCheckbox').checked) {
        //add the make dependencys
        for (const makedep of json['optdepends'].values()) {
            allDeps.add(makedep);
        }
    }
    return allDeps;
}

async function addSubtree(rootNode, graph, cache) {

    //retrieve node JSON
    getNodeJSON(rootNode).then((nodeJSON) => {
        if (nodeJSON.hasOwnProperty('depends')) {
            const dependencies = getDepsFromJSON(nodeJSON);
            //add the node to the graph while replacing the unnecessary additional text
            graph.addNode(rootNode.replace(/:\s.*/, ''),
                JSON.parse(`{"repository": "${nodeJSON['repo']}"}`));

            //iterate over all those dependencies
            for (const dependency of dependencies) {

                //check if circular dependencies are allowd
                if (document.getElementById('allowCircularDependencies').checked) {
                    //add a link from the rootnode to that dependency
                    graph.addLink(rootNode, dependency);
                } else {
                    if (!cache.has(dependency)) {
                        graph.addLink(rootNode, dependency);
                    }
                }

                //check if the dependency is cached (if the subtree has already been drawn for it
                if (!cache.has(dependency)) {

                    //initiate recursive call to build subtree for that dependency
                    addSubtree(
                        dependency,
                        graph,
                        cache
                    );
                    //add the dependency to the cache so that in the next loop iteration it will not be handled again
                    cache.add(dependency);
                }
            }
        }
    });
}