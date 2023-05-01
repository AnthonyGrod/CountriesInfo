const qs = require('querystring');
const express = require('express');

const { getCountryList, getCountryInfo } = require("./apiHelper.js");

const PORT = 8080;

const COUNTRY_URL = 'https://restcountries.com/v3.1/name/';
const CONTINENT_URL = 'https://restcountries.com/v3.1/region/';

const app = express();
app.use(express.static(__dirname +'/public'));

function selector(min, max, redirected) {
	let body = ``;
	if (redirected) {
		body = `<p>Chosen continent does not have that many countries available.</p>`;
	}
	return `<html>
				<head><link rel=stylesheet href="/css/style.css"/></head>
                ${body}
				<body>
                	<form method="post" action="/show">
					<label  for="continent">Choose your continent:</label>
						<select id="continent" name="continent">
							<option value="North America">North America</option>
							<option value="South America">South America</option>
							<option value="Oceania">Oceania</option>
							<option value="Europe">Europe</option>
							<option value="Asia">Asia</option>
							<option value="Africa">Africa</option>
							<option value="Antarctica">Antarctica</option>
						</select>
						</br>
						<label for="number">Choose a number between 2 and 10:</label>
							<input type="number" id="number" name="number" min=${min} max=${max} required>
						<button type="submit">Submit</button>
					</form>
				</body>
			</html>`;
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
		try {
			const countryList = await getCountryList(continent, number, CONTINENT_URL);
			if (countryList.length < number) {
			  throw new Error();
			}
			countryList.sort(function (a, b) {
				if (a > b)
					return 1;
				if (a < b)
					return -1;
				return 0;
			});
			res.write(`\r\n<html><head><link rel=stylesheet href="/css/style.css"/></head><body>`);
			for (const country of countryList) {
				let countryInfo = await getCountryInfo(country, COUNTRY_URL);
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
		} catch (error) {
			console.error(error);
			res.write(generateResponse('/', 2, 10, true));
			res.end();
		}
	});
}


function generateResponse(url, min, max, redirected) {
	if (url === '/')
		return selector(min, max, redirected);
	else
		return `<html><p>404 Not Found</p></body></html>`;
}

app.get('/', (req, res) => {
	res.set('Content-Type', 'text/html')
	res.send(generateResponse(req.url, 2, 10));
})

app.post('/show', (req, res) => {
	res.set('Content-Type', 'text/html')
	show(req, res);
})

app.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`);
});

