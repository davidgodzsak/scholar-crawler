const phantom = require('phantom');

function delay(t, v) {
   return new Promise(function(resolve) {
       setTimeout(resolve.bind(null, v), t)
   });
}

async function getBibtex(start, query, i){
	console.log("I am fork", i, start, query);	
	const pe = await phantom.create();
	const page = await pe.createPage();
	page.property('viewportSize', { width: 1024, height: 600 });

	const status = await page.open(`https://scholar.google.com/scholar?hl=en&q=${query}`);

	if(status !== 'success'){
		console.log("Could not open the page");
		phantom.exit(1);
		process.exit(1);
	}

	page.render(i+".png")
	await page.evaluate(function(nth){document.getElementsByClassName("gs-or_cit gs_nph")[nth].click()}, i);
	await delay(100).then(()=> page.evaluate(function() {document.querySelector("#gs_citi a:first-child").click()}));
	return delay(100).then(()=>page.evaluate(function(){return document.getElementsByTagName("pre")[0].innerHTML}));
}

process.on('message',(m)=> {
	getBibtex(m.pagei, m.query, m.i)
		.then(txt=> process.send({txt}))
})
