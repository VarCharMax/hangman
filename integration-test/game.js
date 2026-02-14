/* eslint-disable no-undef */

import { expect } from 'chai';
import puppeteer from 'puppeteer';

describe('Website UI Integration', function () {
  // Extend default timeout for Puppeteer operations
  this.timeout(30000);

  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({ headless: true }); // set to false to watch the browser actions
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:5000');
  });

  after(async function () {
    await browser.close();
  });

  it('should have the correct page title', async function () {
    const title = await page.title();
    expect(title).to.equal('Hangman');
  });

  /*
  it('should have an H1 element with specific text', async function () {
    // Use page.$eval to select an element and run a function in the browser context
    const h1Text = await page.$eval('h1', (el) => el.textContent);
    expect(h1Text).to.equal('Example Domain');
  });

  it('should have only one paragraph element', async function () {
    // Use page.$$ to select all matching elements and check the count
    const paragraphs = await page.$$('p');
    expect(paragraphs).to.have.lengthOf(1);
  });
  */
});
