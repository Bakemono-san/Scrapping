const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs'); // Added for file system access

(async function scrapeProducts() {
  // Initialize the webdriver with options to accept insecure certificates
  const options = new firefox.Options().setAcceptInsecureCerts(true);
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();

  let currentPage = 1;
  let hasMorePages = true;
  const allLinks = {}; // Object to store links with count as key

  try {
    while (hasMorePages) {
      // Navigate to the products page URL with current page offset
      const url = `https://infomat.cataloguebaraka.com/index.php/informatique?start=${(currentPage - 1) * 10}`;
      await driver.get(url);

      // Wait for the page to load (adjust the delay as needed)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Find all product containers
      const productContainers = await driver.findElements(By.css('div[class="spacer"]'));

      // Iterate over each product container and extract details
      for (const product of productContainers) {
        const productLink = await product.findElement(By.css('h2 > a')).getAttribute('href');
	console.log(`Product ${Object.keys(allLinks).length} : ${productLink}`);
        allLinks[Object.keys(allLinks).length] = productLink; // Add link with count as key
	
      }

      // Check if there's a "Next" button and navigate if available
      try {
        const nextButton = await driver.wait(until.elementLocated(By.css('li.pagination-next > a')), 5000);
        await nextButton.click();
        currentPage++;
      } catch (error) {
        // No next button found, likely on the last page
        hasMorePages = false;
      }
    }

    // Save all links to JSON file
    const data = JSON.stringify(allLinks, null, 2); // Pretty-print JSON
    fs.writeFileSync('product_links.json', data);
    console.log('Product links saved to product_links.json');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the webdriver
    await driver.quit();
  }
})();

