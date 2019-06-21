/* exported workerScriptWraper */
function workerScriptWraper() {
  'use strict';

  /* eslint-env worker */
  /* global self */
  /* eslint no-restricted-globals: ["off", "self"] */

  function requestTimeout(milliseconds) {
    return new Promise((_, reject) => setTimeout(reject, milliseconds, new Error('Connection timeout')));
  }


  async function getData(url, maxWaitTime) {

    const requestOptions = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/plain; charset=UTF-8'
      }),
      mode: 'cors',
      credentials: 'omit',
      cache: 'default'
    };

    try {

      const response = await Promise.race([
        fetch(url, requestOptions),
        requestTimeout(maxWaitTime)
      ]);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();

    } catch (err) {
      return null;
    }
  }


  function filterData(rawData) {

    /*
     * Input:
     * rawData -- object with data and metadata retrieved from Eurostat API
     *
     *
     * Extract necessery data and transform it to a table format.
     * Each property of the output object represents a column (characteristic,
     * attribute, feature) and each row (index) represents a single country.
     *
     *
     * Return an object with three properties:
     * -- gdp -- typed array of unsigned integers, volume index of Gross
     *           Domestic Product per capita in Purchasing Power Standards
     *           for European Economic Area countries in 2017,
     * -- names -- array of strings, full country names,
     * -- codes -- array of upper-case strings, two-letter country codes
     *             (ISO 3166-1 alpha-2).
     */

    // List of European Economic Area countries, w/o Liechtenstein (LI)
    // eslint-disable-next-line max-len
    const codes = 'AT,BE,BG,HR,CY,CZ,DK,EE,FI,FR,DE,EL,HU,IS,IE,IT,LV,LT,LU,MT,NL,NO,PL,PT,RO,SK,SI,ES,SE,CH,UK'.split(',');

    const { label: labels, index: indexes } = rawData.dimension.geo.category;
    const { value: values } = rawData;

    const names = [];
    const gdp = new Uint16Array(codes.length);

    let pos = 0;
    let cod;

    for (pos; pos < codes.length; pos++) {
      cod = codes[pos];
      gdp[pos] = values[indexes[cod]];
      names.push(labels[cod]);
    }

    return { gdp, names, codes };
  }


  function cleanData(data) {

    // Clean data in place (mutate the object)

    const { codes, names } = data;

    // Regular expression for finding a comment
    // inside parenthesis at the end of a string
    const regex = / \([a-zA-Z0-9 ]*\)$/;

    const pos = codes.indexOf('DE');

    names[pos] = names[pos].replace(regex, '');
  }


  function sortData(data) {

    // Sort data in place (mutate the object)

    const { codes, names, gdp } = data;
    const indexes = codes.map((_, i) => i);

    // Sort indexes in descending order based on DGP values
    indexes.sort((i, j) => gdp[j] - gdp[i]);

    data.codes = indexes.map(i => codes[i]);
    data.names = indexes.map(i => names[i]);
    data.gdp = new Uint16Array(indexes.map(i => gdp[i]));
  }


  function calculateArithmeticMean(arr) {
    const total = arr.reduce((sum, num) => sum + num, 0);
    return total / arr.length;
  }


  self.onmessage = async () => {

    // Eurostat REST API info:
    // https://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/rest-request
    const base = 'http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/';

    // Volume index of Gross Domestic Product per capita in Purchasing Power Standards in 2017, EU28=100
    // https://ec.europa.eu/eurostat/web/products-datasets/-/tec00114
    const requestURL = `${base}tec00114?time=2017&precision=4`;

    const rawData = await getData(requestURL, 3000);

    if (rawData === null) {
      self.postMessage(null);
      return;
    }

    const data = filterData(rawData);

    cleanData(data);
    sortData(data);

    data.summary = {
      title: 'GDP per capita in PPSs for EEA countries in 2017\nBased on Eurostat data',
      mean: calculateArithmeticMean(data.gdp)
    };

    self.postMessage(data);
  };

}
