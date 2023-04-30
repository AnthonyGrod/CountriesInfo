const http = require('http');
const qs = require('querystring');

const PORT = 8080;

const COUNTRY_URL = 'https://restcountries.com/v3.1/name/';
const CONTINENT_URL = 'https://restcountries.com/v3.1/region/';

// curl -X GET -d 'continent=North+America&number=2' localhost:8080/show

function getCountryData(countryName, request) {
	return new Promise((resolve, reject) => {
		request({
			url: `${COUNTRY_URL}${countryName}`,
			json: true,
		}, (err, response, body) => {
			if (err)
				reject(err);
			else if (response.statusCode !== 200)
				reject(`An error occured. Response status code: ${response.statusCode}`);
			else
				resolve(body);
		});
	});
}


function getContinentData(continent, request) {
	return new Promise((resolve, reject) => {
		request({
			url: `${CONTINENT_URL}${continent}`,
			json: true,
		}, (err, response, body) => {
			if (err)
				reject(err);
			else if (response.statusCode !== 200)
				reject(`An error occured. Response status code: ${response.statusCode}`);
			else
				resolve(body);
		});
	});
}

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
							<input type="number" id="number" name="number" min="2" max="10" required>
						<button type="submit">Submit</button>
					</form>
				</body>
			</html>`;
}


async function getCountryList(continent, number) {
	const request = require("request");
	let continentData = await getContinentData(continent, request);
	let countries = continentData.map((country) => country.name.common);
	return countries.slice(0, number);
}


async function getCountryInfo(countryName) {
	const request = require("request");
	let countryData = await getCountryData(countryName, request);
	let countryInfo = {
		name: countryData[0].name.official,
		capital: countryData[0].capital,
		population: countryData[0].population,
		currencies: countryData[0].currencies,
		subregion: countryData[0].subregion,
		languages: countryData[0].languages,
	}
	return countryInfo;
}


function checkIfDefined(name, value) {
	if (value === undefined)
		return name + ': No information found!' + '<br>';
	else
		return name + ': ' + value + '<br>';
}


function show(req, res) {
	let body = '';
	req.on('data', (chunk) => {
		body += chunk;
	});
	req.on('end', async () => {
		const data = qs.parse(body);
		const continent = data.continent;
		const number = parseInt(data.number);
		const countryList = await getCountryList(continent, number);
		countryList.sort(function (a, b) {
			if (a > b) {
			  return 1;
			}
			if (a < b) {
			  return -1;
			}
			return 0;
		});
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(`\r\n<html><body>`);
		for (const country of countryList) {
			let countryInfo = await getCountryInfo(country);
			let languagesList = Object.values(countryInfo.languages);
			const firstCurrencyCode = Object.keys(countryInfo.currencies)[0];
			const firstCurrencyName = countryInfo.currencies[firstCurrencyCode].name;
			res.write(`
				<p>
				${checkIfDefined("Country Name", countryInfo.name)}
				${checkIfDefined("Capital", countryInfo.capital)}
				${checkIfDefined("Population", countryInfo.population)}
				${checkIfDefined("Currency", firstCurrencyName)}
				${checkIfDefined("Subregion", countryInfo.subregion)}
				${checkIfDefined("Languages", languagesList)}
				</p>
				`);
		}
		res.write(`</body></html>\r\n`);

		res.end();
	});
}


function generateResponse(url, min, max) {
	if (url === '/')
		return selector(min, max);
	else
		return `<html><body><p>404 Not Found</p></body></html>`;
}


const server = http.createServer((req, res) => {
	const url = req.url;
	if (url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(generateResponse(url, 2, 10));
		res.end();
	} else if (url === '/show') {
		show(req, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.write(generateResponse(url));
		res.end();
	}
});


server.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`);
});

