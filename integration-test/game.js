/* eslint-disable no-undef */

import { expect } from 'chai';
import puppeteer from 'puppeteer';

var rootUrl = 'http://localhost:5000'; // + process.env.TEST_PORT || 3000;

describe('Website UI Integration', function () {
  this.timeout(60000);

  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({ headless: true, devtools: true });
    page = await browser.newPage();
    page.setCacheEnabled(false);
    // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    // Go to home page.
    await page.goto(rootUrl, { waitUntil: 'networkidle2' });
    await clearAllCookies(browser);
  });

  after(async function () {
    await browser.close();
  });

  it('should display title', async function () {
    const title = await page.title();
    expect(title).to.equal('Hangman');
  });

  it('should return 400 with message on invalid game submission', async function () {
    const gameInputHandle = await page.$('#word');
    await gameInputHandle.type('to');
    const responsePromise = page.waitForResponse(() => {
      return true;
    });
    await page.click('#gameCreate');

    const response = await responsePromise;
    const responseData = await response.text();

    expect(response.status()).to.equal(400);
    expect(
      responseData,
      'Word must be at least three characters long and contain only letters'
    );
  });

  it('should find new game listed after submission', async function () {
    const regex = /.+?(?:\r?\n|$)/g;
    const testWord = 'Example';
    const gameInputHandle = await page.$('#word');
    await gameInputHandle.click({ clickCount: 3 }); //Select any existing text.
    await gameInputHandle.type(testWord);

    await Promise.all([page.waitForSelector('.game'), page.click('#gameCreate')])
      .then(async () => {
        const element = await page.$('.game');
        if (element) {
          let text = await page.evaluate((el) => el.textContent, element);
          text = text.match(regex)[0].trim(); // A bit kludgy, can we come up with an re that does all of this?
          expect(text).to.equal(testWord.toUpperCase());
        }
      })
      .catch(() => {});
  });

  // Register user
  /*
  it('should return 304 then 400 on valid game submission', async function (done) {
    // const wordValue = await page.$eval('#word', (el) => el.value);

    const gameInputHandle = await page.$('#word');
    await gameInputHandle.type('Example');

    await Promise.all([
      page.waitForResponse((res) => {
        // Look for game listed.

        done();
      }),
      page.waitForResponse((res) => {
        // Look for game listed.
        //expect(res).to.equal('400');
        done();
      }),
      page.click('#gameCreate'),
    ]);
  });


  it('should display empty game', async function (done) {
    const wordValue = await page.$eval('#word', (el) => el.value);
    expect(wordValue).to.equal('_______');
    done();
  });

  it('should create game', async function () {
    // Look for game object in html.
  });

  it('should register E as valid positional character', async function () {
    // await page.keyboard.press('/')('keydown', page.event.key.E);
    page.keyboard.down('KeyE').then(async (done) => {
      // eslint-disable-next-line no-debugger
      debugger;
      const wordValue = await page.$eval('#word', (el) => el.value);
      const missedLetters = await page.$eval('#missedLetters', (el) => el.value);
      console.log(wordValue);
      expect(wordValue).to.equal('E_____E');
      expect(missedLetters).to.be.empty;
      done();
    });
  });

  it('should register T as missed character', async function () {
    page.keyboard.down('KeyT').then(async (done) => {
      // eslint-disable-next-line no-debugger
      debugger;
      const wordValue = await page.$eval('#word', (el) => el.value);
      const missedLetters = await page.$eval('#missedLetters', (el) => el.value);
      expect(wordValue).to.equal('E_____E');
      expect(missedLetters).to.equal('T');
      done();
    });
  });
  */
});

/**
 * Clears all cookies for the current page's browser context.
 * @param {import('puppeteer').Page} page - The Puppeteer page object.
 */
async function clearAllCookies(browser) {
  // Get all cookies from the current page's context
  const cookies = await browser.cookies();

  // Delete all the retrieved cookies using the spread operator
  await browser.deleteCookie(...cookies);

  console.log('All cookies cleared.');
}
