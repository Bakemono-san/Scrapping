const fs = require('fs');
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

(async function scrapeProducts() {
  const options = new firefox.Options().setAcceptInsecureCerts(true);
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();

  try {
    // Read the links from the JSON file
    const linksFile = 'product_links.json';
    const links = JSON.parse(fs.readFileSync(linksFile, 'utf8'));

    const scrapedProducts = [];

    // Call the scrapeProduct function for each link
    for (const [index, link] of Object.entries(links)) {
      console.log("Pdt No: ",index);
      const productDetails = await scrapeProduct(driver, link);
      scrapedProducts.push({ index, ...productDetails });
    }

    // Save the scraped products to a JSON file
    const outputFile = 'scraped_products.json';
    fs.writeFileSync(outputFile, JSON.stringify(scrapedProducts, null, 2));
    console.log(`Scraped products saved to ${outputFile}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await driver.quit();
  }
})();

async function scrapeProduct(driver, productUrl) {
  try {
    // Navigate to the product page
    await driver.get(productUrl);
    // Wait for the product container to be present
    await driver.wait(until.elementLocated(By.css('.vm-product-container')), 10000);
    // Get the product name
    const productName = await driver.findElement(By.css('h1')).getText();
    console.log(productName);
    // Get the product price
    const productPrice = await driver.findElement(By.css('.PricesalesPrice')).getText();
    // Get the product description
    const productDescription = await driver.findElement(By.css('.product-short-description')).getText();
    // Get the product availability
    let productAvailability;
    try {
      productAvailability = await driver.findElement(By.css('.availability')).getText();
    } catch (error) {
      productAvailability = 'Stock Epuisé';
    }
    // Get the main product image URL
    const mainImageUrl = await driver.findElement(By.css('.main-image a')).getAttribute('href');
    // Get additional product image URLs
    const additionalImageElements = await driver.findElements(By.css('.additional-images a'));
    const additionalImageUrls = await Promise.all(additionalImageElements.map(async (element) => {
      return await element.getAttribute('href');
    }));

    return {
      productName,
      productPrice,
      productDescription,
      productAvailability,
      mainImageUrl,
      additionalImageUrls
    };
  } catch (error) {
    console.error(`Error scraping product at ${productUrl}:`, error);
    return {};
  }
}
