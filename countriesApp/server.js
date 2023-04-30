const http = require('http');
const qs = require('querystring');
const express = require('express');
const path = require('path');

const { getCountryList, getCountryInfo } = require("./apiHelper.js");

const PORT = 8080;

const COUNTRY_URL = 'https://restcountries.com/v3.1/name/';
const CONTINENT_URL = 'https://restcountries.com/v3.1/region/';

const app = express();
app.use('/css',express.static(__dirname +'/css'));

function selector(min, max, redirected) {
	let body = ``;
	if (redirected) {
		body = `<p>Chosen continent does not have that many countries available.</p>`;
	}
	return `<html>
                <style>
                body {
                text-align: center;
                background-color: linen;
                }

                form {
                color: maroon;
                text-align: center;
								font-size: 20px;
                }
                </style>
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
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(`\r\n<html><head>
                <style>
                body {
                text-align: center;
                background-color: linen;
                }

                p {
                color: maroon;
                text-align: center;
								font-size: 25px;
                }
                </style></head><body>`);
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
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(generateResponse('/', 2, 10, true));
			res.end();
		}
	});
}


function generateResponse(url, min, max, redirected) {
	if (url === '/')
		return selector(min, max, redirected);
	else
		return `<html><head><p>404 Not Found</p></body></html>`;
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

