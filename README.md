# OpenAurae v2

OpenAurae is a Monash University project created to collect indoor environmental measurements for research and analysis.
The project was developed by [Michael Strauss](https://www.linkedin.com/in/michaelcstrauss/) for [low-cost environment monitoring](https://michaelstrauss.dev/openaurae).

The previous version (v1) ran on an AWS EKS cluster but was discontinued due to high maintenance costs. 
Access to the original [code repository](https://bitbucket.org/monashaurae/aurae-web/src/master/) requires permission from the lab manager.

The current version (v2) moves most components from the cloud to local lab servers and includes several key improvements:

- A completely redesigned user interface
- Much faster sensor reading queries across wide time ranges
- Added support for [NEMo devices](#nemo)

## Get Started

- Learn about different [devices](#devices) and how [sensor readings](#readings) work
- Set up [development environment](./docs/setup-dev-env.md) on your local machine

## Devices

A device is a piece of IoT hardware with sensors that collect environmental measurements.

### Air Quality Box

An air quality box contains:

- A [PTQS1005 gas sensor](https://www.plantower.com/en/products_36/82.html)
- A [PMS5003 PM2.5 sensor](https://www.plantower.com/en/products_33/74.html)
- A [Raspberry Pi Zero](https://www.raspberrypi.com/products/raspberry-pi-zero/) that runs Python code to send measurements to the MQTT broker

Note:

- You cannot add or remove sensors from an air quality box
- All PTQS1005 sensors use the same sensor ID (`ptqs1005`)
- All PMS5003 sensors use the same sensor ID (`pms5003st`)

### Zigbee Device

![Xiaomi IoT Sensors](./docs/xiaomi-sensors.png)

Xiaomi IoT sensors work in a [Zigbee](https://en.wikipedia.org/wiki/Zigbee) network,
which uses a protocol designed for devices with low power and bandwidth needs.
[Zigbee2MQTT](https://www.zigbee2mqtt.io/guide/getting-started/) bridges the Zigbee network messages to an MQTT broker.

A Zigbee device is a Raspberry Pi with a [wireless Zigbee adapter](https://www.aliexpress.com/item/1005001863186352.html). 
It runs Zigbee2MQTT software so Xiaomi sensors can connect to it and send messages to the MQTT broker.

Available Zigbee sensor types:

- Temperature
- Occupancy
- Contact
- Vibration
- Power

Note:

- Sensors can be paired with or unpaired from Zigbee devices
- A single Zigbee device can have multiple sensors of the same type

### NEMo

[NEMo devices](https://www.ethera-labs.com/en/air-quality-monitoring-station-nemo/) are portable air quality monitors made by [Ethera](https://www.ethera-labs.com/en/). 
They're installed in buildings 60 and 69 to monitor air quality in different rooms.

NEMo devices only send data to Ethera's servers ([NEMo Cloud](https://www.nemocloud.com/) and [NEMo Could S5](https://s5.nemocloud.com)), 
so the OpenAurae server must regularly fetch recent measurements to store in the local database.

NEMo sensors collect these metrics:

- Formaldehyde (CH2O)
- CO2
- LVOC
- Temperature
- Relative Humidity
- Air Pressure
- NO2
- O3
- PM 1/2.5/10

## Readings

A reading is a record of sensor measurements taken at a specific time. Readings are collected in two ways:

1. By subscribing to MQTT topics and processing messages from air quality boxes and Zigbee devices
2. By calling the NEMo cloud API to get NEMo device measurements for a specific time range

Readings may be adjusted using **corrections** (formulas like `23.774*ch2o+57.093`) to improve accuracy.

### Readings From MQTT Broker

The OpenAurae server subscribes to specific MQTT topics to receive sensor measurement messages in JSON format. 
Here's an example message from a PTQS1005 sensor:

```json
{
  "topic": "air-quality/pms",
  "sensor": "ptqs1005",
  "device_id": "b8:27:eb:6f:cd:af",
  "ip_address": "127.0.0.1",
  "latitude": 45.4,
  "longitude": 100.3,
  "tmp": 12.3,
  "rh": 12.3,
  "pm25": 12.3,
  "tvoc": 12.3,
  "co2": 12.3,
  "ch2o": 12.3,
  "time": "2019-01-01T18:44:19"
}

```

When the server receives a message, it:

1. Validates the message payload
2. Converts the message to an unprocessed reading (with original values)
3. Creates a processed reading by:
   - Duplicating the unprocessed reading
   - Applying any relevant corrections
4. Saves both the processed and unprocessed readings to the database

### Readings From NEMo Cloud

The server regularly fetches the latest readings by:

1. Calling `/session/login` to authenticate
2. Getting measure sets by calling `/measureSets` with the device ID, start time, and end time
3. For each measure set:
    - Getting measures by calling `/measureSets/{measureSetBid}/measures`
    - For each measure (values of a single metric):
        - Getting measure values by calling `/measures/{measureBid}/values`
        - For each measure value:
            - Converting the value to a partial reading record (setting only the primary key and metric field)
            - Inserting the record into the database (Scylla only updates non-null values)

