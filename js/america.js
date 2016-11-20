addAmerica();
flipAmerica();
let data;

function addAmerica() {
    let loader = new THREE.OBJLoader();
    loader.load('models/us_map.obj', (object) => {
        scene.add(object);
        getStates(object, false);
    });
}

function flipAmerica() {
    let loader = new THREE.OBJLoader();
    loader.load('models/us_map.obj', (object) => {
        scene.add(object);
        getStates(object, true);
    });
}

function getStates(object, flip) {
    let states = object.children;
    for (let i = 0; i < states.length; i++) {
        let name = states[i]['name'].replace(/(_Mesh)\.?(\d{3})?/, '');
        let geometry = states[i].geometry;
        states[i]['name'] = name;
        states[i].material = states[i].material.clone();
        states[i].ownMaterial = true;
    }
    ingestData(states, flip);
}

let percentArr = [];
function setStateValues(states, data, flip) {
    for (let i = 0; i < states.length; i++) {
        let key = states[i].name;
        let eligible_voters = parseInt(data[key].eligible_voters);
        let democrat_votes = parseInt(data[key].democrat_votes);
        let republican_votes = parseInt(data[key].republican_votes);
        let total_votes = democrat_votes + republican_votes;
        let percentage = total_votes / eligible_voters;

        states[i]['userData']['state'] = data[key].state;
        states[i]['userData']['eligible_voters'] = eligible_voters;
        states[i]['userData']['democrat_votes'] = democrat_votes;
        states[i]['userData']['republican_votes'] = republican_votes;
        states[i]['userData']['total_votes'] = total_votes;
        states[i]['userData']['flip'] = flip;

        let height;
        if(!flip) {
            height = total_votes / 1000000;
            percentArr.push(percentage);
        } else {
            height = (eligible_voters - total_votes) / 1000000;
        }

        states[i].scale.z = height;
        let bound = new THREE.Box3().setFromObject(states[i]);
        if(!flip) {
            states[i].position.z = Math.abs(bound.min.z);
        } else {
            states[i].position.z = Math.abs(bound.max.z);
        }

        function toHex(e) {
            let hex = e.toString(16);
            if (hex.length === 1) {
                return '0' + hex;
            } else if (hex.length > 2){
                return 'ff';
            } else {
                return hex;
            }
        }

        if(!flip) {
            if(democrat_votes > republican_votes) {
                let r, g, b;
                let mult = (republican_votes / democrat_votes) * 100;
                mult = Math.round(mult);
                g = mult * 2;
                r = mult * 2;
                b = 33 * mult * 2;
                let hexcolor = toHex(r) + toHex(g) + toHex(b);
                states[i].material.color.setHex('0x'+hexcolor);
            } else {
                let r, g, b;
                let mult = (democrat_votes / republican_votes) * 100;
                mult = Math.round(mult);
                g = mult * 2;
                r = 33 * mult * 2;
                b = mult * 2;
                let hexcolor = toHex(r) + toHex(g) + toHex(b);
                states[i].material.color.setHex('0x'+hexcolor);
            }
        } else {
            let r, g, b;
            let min = Math.min.apply(Math, percentArr);
            let max = Math.max.apply(Math, percentArr);
            percentage = ((percentage - min)/(max - min)) * 100;
            let mult = Math.round(percentage);
            g = mult * 2;
            r = mult * 2;
            b = mult * 2;
            let hexcolor = toHex(r) + toHex(g) + toHex(b);
            states[i].material.color.setHex('0x'+hexcolor);
        }
    }
}

function ingestData(states, flip) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            const data = JSON.parse(httpRequest.responseText);
            setStateValues(states, data, flip);
            setTotals(data);
        }
    }
    httpRequest.open('GET', 'http://192.168.1.105/webvr/thestates/data/election_results.php');
    httpRequest.send(null);
}

function setTotals(data) {
    let repub = 0
    let demo = 0;
    let elig = 0;
    for(state in data) {
        repub = repub + parseInt(data[state].republican_votes);
        demo = demo + parseInt(data[state].democrat_votes);
        elig = elig + parseInt(data[state].eligible_voters);
    }
    let total = repub + demo;
    let turnout = parseInt((total / elig) * 100);
    const totals = document.getElementById('totals');
    totals.innerHTML = "<p> Eligible Voters: " + elig.toLocaleString() + "</p><p>Total Votes: " + total.toLocaleString() + "</p>";
    totals.innerHTML += "<p>Voter Turnout: " + turnout + "%</p><p>Democrat: " + demo.toLocaleString() + "</p><p> Republican: " + repub.toLocaleString() + "</p>";
}
