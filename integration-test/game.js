/* eslint-disable no-undef */

import { expect } from 'chai';
import puppeteer from 'puppeteer';

//Populate env variables from .env file.
// dotenv.config({ path: './.test_env' });

const TEST_PORT = process.env.TEST_PORT;

var rootUrl = `http://localhost:${TEST_PORT}`;

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
  }, 10000);

  after(async function () {
    await page.close();
    await browser.close();
  });

  it('should display title', async function () {
    const title = await page.title();
    expect(title).to.equal('Hangman');
  }, 15000);

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
  }, 15000);

  it('should find new game listed after submission', async function () {
    const testWord = 'Example';
    const gameInputHandle = await page.$('#word');
    await gameInputHandle.click({ clickCount: 3 }); //Select any existing text.
    await gameInputHandle.type(testWord);

    await Promise.all([page.waitForSelector('.game'), page.click('#gameCreate')]).then(
      async () => {
        const element = await page.$('.word');
        if (element) {
          let text = await page.evaluate((el) => el.textContent, element);
          expect(text).to.equal(testWord.toUpperCase());
        }
      }
    );
  }, 15000);

  // Register user
  /*
  it('should list available game after user registration', async function () {
    // const wordValue = await page.$eval('#word', (el) => el.value);
    clearAllCookies();
    const gameInputHandle = await page.$('#name');
    await gameInputHandle.type('User2');

    await Promise.all([page.waitForSelector('.game'), page.click('#userCreate')]).then(
      async () => {
        const element = await page.$('.game');
        if (element) {
          let text = await page.evaluate((el) => el.textContent, element);
          text = text.match(regex)[0].trim(); // A bit kludgy, can we come up with an re that does all of this?
          expect(text).to.equal(testWord.toUpperCase());
        }
      }
    );
  }, 15000);
*/
  /*
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
 * @param {import('puppeteer').Browser} browser - The Puppeteer browser object.
 */
async function clearAllCookies(browser) {
  // Get all cookies from the current page's context
  const cookies = await browser.cookies();

  // Delete all the retrieved cookies using the spread operator
  await browser.deleteCookie(...cookies);

  // console.log('All cookies cleared.');
}
