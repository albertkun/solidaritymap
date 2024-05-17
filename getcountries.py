import csv
import time
from geopy.geocoders import Nominatim

# Initialize the geocoder
geolocator = Nominatim(user_agent="YourUniqueAppName")

def get_location_by_coordinates(lat, lon):
    location = geolocator.reverse([lat, lon], exactly_one=True)
    if location is None:
        return '', ''
    address = location.raw['address']
    city = address.get('city', '')
    country = address.get('country', '')
    return city, country
# Read the CSV file and add city and country
with open('markers.csv', 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    data = list(csv_reader)

# Add city and country to the header
data[0].extend(['City', 'Country'])

for i in range(1, len(data)):
    lat, lon = data[i][0], data[i][1]
    city, country = get_location_by_coordinates(lat, lon)
    data[i].extend([city, country])
    time.sleep(.5)  # Add a delay between requests

# Write the data back to the CSV file
with open('markers.csv', 'w', newline='', encoding='utf-8') as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerows(data)