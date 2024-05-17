import re
import csv
import requests
import os 
import unicodedata
# Pattern to match image URLs
image_pattern = re.compile(r'<img src="(.*?)"')
# Load the JavaScript file
with open('data.js', 'r') as file:
    js = file.read()

# Pattern to match marker data
marker_pattern = re.compile(r'var marker_[a-zA-Z0-9_]+ = L\.marker\(\s*\[\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*\]')

# Pattern to match popup data
popup_pattern = re.compile(r'var html_[a-zA-Z0-9_]+ = \$\(`(.*?)`\)\[0\];', re.DOTALL)

# Create a CSV file
with open('markers.csv', 'w', newline='') as csvfile:
    fieldnames = ['latitude', 'longitude', 'name', 'location', 'start_date', 'status', 'category', 'police_violence_status', 'number_of_arrests','image_url']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()

    # Extract the marker and popup data
    marker_matches = marker_pattern.findall(js)
    popup_matches = popup_pattern.findall(js)

    # Make sure there are the same number of markers and popups
    assert len(marker_matches) == len(popup_matches)

    # Loop through each marker and its corresponding popup
    for (lat, lon), popup_html in zip(marker_matches, popup_matches):
        name = re.search(r'<h4 align="left".*?><u>(.*?)</u>', popup_html)
        location = re.search(r'<i class="fa fa-map-marker"></i> Location: </strong> (.*?)\s', popup_html)
        start_date = re.search(r'<i class="fa-regular fa-calendar-days"></i> Start Date:</strong> (.*?)\s', popup_html)
        status = re.search(r'<i class="fa-solid fa-layer-group"></i> Status:</strong> (.*?)\s', popup_html)
        category = re.search(r'<i class="fa-solid fa-layer-group"></i> Category: </strong> (.*?)\s', popup_html)
        police_violence_status = re.search(r'<i class="fa-solid fa-handcuffs"></i> Police Violence Status:</strong> (.*?)\s', popup_html)
        number_of_arrests = re.search(r'<i class="fa-solid fa-handcuffs"></i> Number of Arrests:</strong> (.*?)\s', popup_html)

        # Extract the image URL
        image_url = image_pattern.search(popup_html)
        image_url = image_url.group(1) if image_url else None
        if image_url:
            response = requests.get(image_url)

            # Make sure the request was successful
            if response.status_code == 200:
                # Create a directory to store the images if it doesn't exist
                os.makedirs('images', exist_ok=True)

                # Ensure the name is a valid filename
                valid_name = "".join(c for c in name.group(1) if c.isalnum() or c in (' ', '.')).rstrip()

                # Normalize the name to form suitable for filename
                valid_name = unicodedata.normalize('NFKD', valid_name).encode('ASCII', 'ignore').decode()

                # # Save the image to a file
                # with open(f'images/{valid_name}.jpg', 'wb') as file:
                #     file.write(response.content)

                # Update the image URL to the path of the downloaded image
                image_url = f'/images/{valid_name}.jpg'

        writer.writerow({
            'latitude': lat,
            'longitude': lon,
            'name': name.group(1) if name else None,
            'location': location.group(1) if location else None,
            'start_date': start_date.group(1) if start_date else None,
            'status': status.group(1) if status else None,
            'category': category.group(1) if category else None,
            'police_violence_status': police_violence_status.group(1) if police_violence_status else None,
            'number_of_arrests': number_of_arrests.group(1) if number_of_arrests else None,
            'image_url': image_url
        })