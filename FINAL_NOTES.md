# Notes & decisions during development

I skipped on some stuff due to time constraints, like propper logging, more e2e tests. Maybe even a better TrackList module.

Another point is that I felt I was bloating the simple "challenge" with lots of features and stuff.

I think I've added relevant endpoints (like admin), I mostly wanted to show what could be done and not delve too deep, like the admin module retrieving relevant data from orders or the search endpoint so we can quickly check some MBIDs

## Issues spotted at first

Small stuff like record service being empty, logic on the controller. Some inefficient queries, lack of index, timestamps and 2 more timestamp properties, executing queries and then filtering them instead of directly filtering.

## Critical decisions

- I decided to retrieve the MBID track info through workers, so we don't have the risk of failing a call because musicbrainz api failed or taking too long.
  - Used BullMQ for this since it works together with nestjs (https://docs.nestjs.com/techniques/queues)
- Split up the folder structure, personally I prefer this way but I can work with both
- I opted for a "multiple" record type of order, this means we would be able to support currently single orders or in the future `Cart` like operations where we keep adding items into it.
- I tried to assume the most used indexes, added composite for the unique constraint given, also added text index for artist and album as that's what users will be "querying" to search text. Price is probably important too, due to range checks. This is mostly context based, depending on the analytics we have
- I decided not to allow for track update manually, if we want this it might be best to add a specific endpoint for it? Just to keep things clean and be sure we aren't affecting anything with the import from music brainz

## Possible improvements

- Add a "backfilling" for the MBID tracklists of our records, perhaps a cronjob running every minute or 5 minutes that runs X amount of queries
- Extract the qty from the record and create a specific collection for it, keep the records for information only, keep stock and other things outside.
- With a stock module we could probably have some endpoints that show record availability in X time if currently no quantity, as a stock inventory management style
- Better logging, I skipped on this
- Better docker setup, we could have a test docker compose, maybe test containers for e2e tests and more
- Again we have redis here we could probably cache some queries but I don't feel this would impact much even with 100k records, maybe depending on how much traffice we're getting hit with I would consider it

## Test Coverage

- I have counted out the admin module, through the `jest-e2e` file as I consider the admin to be more of a "protytpe", internal tooling kind of module
- We have around 70+ when we exclude the admin module, I think it's sufficient could of spent more time if I had to cover more cases

## Docker

I used mongo express in a separate container to help me check DB stuff

```
docker run -d \
  --name mongo-express \
  --network hworld_challenge_default \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_URL="mongodb://mongodb:27017/?replicaSet=rs0" \
  -e ME_CONFIG_MONGODB_ENABLE_ADMIN=true \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD=pass \
  mongo-express:latest
```

I changed the replica set value initialization, I guess having localhost didn't feel right, for example this container when connecting to it would have issues, because it would get the response from the RS that the address was localhost, but localhost in this case is mongo express
