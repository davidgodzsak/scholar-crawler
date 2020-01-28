const stringify = require('csv-stringify');
const phantom = require('phantom');
const fs = require('fs');
const {fork} = require('child_process')
const Cite = require('citation-js');

// setup
const query = process.argv[2];
const stringifier = stringify({	delimiter: ";"});
const file = fs.createWriteStream("result.csv");

// event handling
file.on('finish', console.log);
file.on('error',(e) => {
	console.log("File write error: " + e);
	process.exit(1);
})
stringifier.on('readable',() => {
	let row;
	while(row = stringifier.read()){
		file.write(row)
	}
});
stringifier.on('error', (e) => {
	console.log("CSV error: " + e);
	process.exit(1);
});

//functions
function gotBibtex(bibtex){
	console.log(bibtex);
}

//crawlingi
async function crawl() {
	console.log(process.argv[2])
	let pagei = 0;
	const pe = await phantom.create();
	const page = await pe.createPage();
	page.property('viewportSize', { width: 1024, height: 600 });

	const status = await page.open(`https://scholar.google.com/scholar?start=${pagei}hl=en&q=${query}`);

	if(status !== 'success'){
		console.log("Could not open the page");
		phantom.exit(1);
		process.exit(1);
	}

	let n = await page.evaluate(function(){return document.getElementsByClassName("gs_or_cit gs_nph").length});

	Array(...Array(10)).map((_,i) => {
		console.log("Starting with " + i);
		const forked = fork("get-bibtex.js");
		forked.on('message', gotBibtex)
		forked.send({i, pagei,query});
	});
	page += n;
}

crawl().then(()=>console.log("done")).catch("error");
