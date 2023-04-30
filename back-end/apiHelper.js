function getCountryData(countryName, request, countryUrl) {
	return new Promise((resolve, reject) => {
		request({
			url: `${countryUrl}${countryName}`,
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


function getContinentData(continent, request, continentUrl) {
	return new Promise((resolve, reject) => {
		request({
			url: `${continentUrl}${continent}`,
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

async function getCountryList(continent, number, continentUrl) {
	const request = require("request");
	let continentData = await getContinentData(continent, request, continentUrl);
	let countries = continentData.map((country) => country.name.common);
	return countries.slice(0, number);
}


async function getCountryInfo(countryName, countryUrl) {
	const request = require("request");
	let countryData = await getCountryData(countryName, request, countryUrl);
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

module.exports = {  getCountryList, getCountryInfo };