const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://twitter.com/emptyflash');

  await page.waitForSelector('a.PhotoRail-headingWithCount');
  const count = await page.evaluate(() => document.querySelector('a.PhotoRail-headingWithCount').text)
  console.error(`Getting ${count.trim()}`)

  await page.waitForSelector('span.tweet-media-img-placeholder');
  await page.click('span.tweet-media-img-placeholder');

  async function printImgLink() {
      await page.waitForSelector('img.media-image');
      let link = await page.evaluate(() => {
          return document.querySelector('img.media-image').src
      })
      console.log(link.replace(":large", ""));
      return link;
  }
  async function hasNext() {
      return await page.evaluate(() => {
          return document.querySelector('div.GalleryNav--next').classList.contains('enabled');
      });
  }
  let previousImage = await printImgLink();
  while(hasNext()) {
      try {
          await page.click('div.GalleryNav--next');
          await page.waitForFunction((previousImage) => {
              var currentImage = document.querySelector('img.media-image').src
              return currentImage != previousImage;
          }, {}, previousImage );
          previousImage = await printImgLink();
      } catch(error) {
          console.error(error);
          break;
      }
  }

  await browser.close();
})();
