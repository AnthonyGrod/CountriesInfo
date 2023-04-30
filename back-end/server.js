const http = require('http');

const PORT = 8080;

const COUNTRY_URL = 'https://restcountries.com/v3.1/name/';

function selector(min, max) {
	return `<html>
				<body>
					<form method="post" action="/show">
						<label for="continent">Choose your continent:</label>
						<select id="continent" name="continent">
							<option value="North America">North America</option>
							<option value="South America">South America</option>
							<option value="Oceania">Oceania</option>
							<option value="Europe">Europe</option>
							<option value="Asia">Asia</option>
							<option value="Africa">Africa</option>
							<option value="Antarctica">Antarctica</option>
						</select>
						<label for="number">Choose a number between 2 and 10:</label>
							<input type="number" id="number" name="number" min="2" max="10">
						<button type="submit">Submit</button>
					</form>
				</body>
			</html>`;
}


function generateResponse(url) {
	if (url === '/')
		return selector(2, 10);
	// else if (url === '/show') 
		// return show() TODO
	else
		return `<html><body><p>404 Not Found</p></body></html>`;
}


const server = http.createServer((req, res) => {
	const generatedRes = generateResponse(req.url);
	if (req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(generatedRes);
		res.end();
	}
	else if (req.url == '/show') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(generatedRes);
		res.end();
	} else {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.write(generatedRes);
		res.end();
	}
});


server.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`);
});

