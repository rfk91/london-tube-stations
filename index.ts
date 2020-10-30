import * as fs from 'fs';
import * as pptr from 'puppeteer';

const URL = 'https://en.wikipedia.org/wiki/List_of_London_Underground_stations';
const selector = 'table.wikitable';

const init = async () => {
  const viewportSize: pptr.Viewport = {
    width: 1920,
    height: 1080,
  };
  const browser = await pptr.launch({
    headless: true,
    args: [`--window-size=${viewportSize.width},${viewportSize.height}`],
    defaultViewport: viewportSize,
  });
  const page = await browser.newPage();
  await page.goto(URL, {
    waitUntil: 'networkidle0',
  });

  const stations = await page.evaluate((selector: string) => {
    const tableEl = document.querySelector(selector);
    const rowsEls = tableEl.querySelectorAll('tbody > tr');
    const stations: string[] = [];
    rowsEls.forEach((el) => {
      const station = el.querySelector('th > a')?.textContent;
      if (station) {
        stations.push(station);
      }
    });
    return stations;
  }, selector);

  await page.close();
  await browser.close();

  fs.writeFileSync('./output/stations.json', JSON.stringify(stations), {
    encoding: 'utf-8',
    flag: 'w',
  });

  let string = 'station\r\n';
  for (let station of stations) {
    string += `${station}\r\n`;
  }
  fs.writeFileSync('./output/stations.csv', string, {
    encoding: 'utf-8',
    flag: 'w',
  });
};
init();
