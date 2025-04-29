# OpenAurae

## Setup Dev Environment

Setup [Timescale database](https://docs.timescale.com/self-hosted/latest/install/installation-docker/)

```shell
docker run -d --name timescaledb \
  -p 5432:5432 \
  -v $PWD/db-data:/var/lib/postgresql/data \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -e POSTGRES_DB=openaurae \
  -e POSTGRES_USER=openaurae \
  -e POSTGRES_PASSWORD=dev \
  timescale/timescaledb-ha:pg17
```

Setup [MQTT Broker](https://docs.emqx.com/en/emqx/latest/deploy/install-docker.html)

```shell
docker run -d --name emqx \
  -p 1883:1883 -p 8083:8083 \
  -p 8084:8084 -p 8883:8883 \
  -p 18083:18083 \
  -v $PWD/mq-data:/opt/emqx/data \
  emqx/emqx-enterprise:5.8.6
```

Start app

Create `.env` file, get NemoCloud accounts from the lab manager

```text
NUXT_DB_HOST="localhost"
NUXT_DB_PORT=5432
NUXT_DB_DATABASE="openaurae"
NUXT_DB_USER="openaurae"
NUXT_DB_PASSWORD="dev"

NUXT_MQTT_PROTOCOL=mqtt
NUXT_MQTT_HOST=localhost
NUXT_MQTT_PORT=1883

NUXT_NEMO_CLOUD_URL="https://www.nemocloud.com"
NUXT_NEMO_CLOUD_OPERATOR=
NUXT_NEMO_CLOUD_PASSWORD=
NUXT_NEMO_CLOUD_COMPANY=

NUXT_NEMO_S5_URL="https://s5.nemocloud.com"
NUXT_NEMO_S5_OPERATOR=
NUXT_NEMO_S5_PASSWORD=
NUXT_NEMO_S5_COMPANY=
```

Start server

```shell
npm run dev
```

## Deploy to Production Environment

Login to fly.io

```shell
fly auth login
```

Deploy database

```shell
cd deploy/timescale

fly app create openaurae-timescale
fly volume create openaurae_timescale_data  --region syd --size 10
fly deploy
```

Deploy MQTT broker

```shell
cd deploy/mqtt

fly app create openaurae-mqtt
fly deploy
```

Deploy app

```shell
fly app create openaurae-app

fly secrets set NUXT_DB_PASSWORD=??? \
  NUXT_NEMO_CLOUD_OPERATOR=??? \
  NUXT_NEMO_CLOUD_PASSWORD=??? \
  NUXT_NEMO_CLOUD_COMPANY=??? \
  NUXT_NEMO_S5_OPERATOR=??? \
  NUXT_NEMO_S5_PASSWORD=??? \
  NUXT_NEMO_S5_COMPANY=???

fly deploy
```

[Setup custom domains](https://fly.io/docs/networking/custom-domain/) for MQTT broker and app.
The domain is available in the AWS account (Route53).
