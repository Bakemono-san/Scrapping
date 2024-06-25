import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# Disable the InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
with open("img_urls.txt") as f:
    urls = f.read().split('\n')
urls.pop()
def download_image(url, filename):
    try:
        # Send a GET request to the URL and disable SSL certificate verification
        response = requests.get(url, stream=True, verify=False)
    
        # Check if the request was successful
        if response.status_code == 200:
            # Open a file for writing
            with open(filename, 'wb') as file:
                # Iterate over the response data and write it to the file
                for chunk in response.iter_content(chunk_size=1024):
                    file.write(chunk)
            print(f"Image '{filename}' downloaded successfully.")
        else:
            print(f"Failed to download image from '{url}'.")
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image: {e}")
    
i=0
for url in urls:
    download_image(url, f"gotten/{i}")
    i+=1
