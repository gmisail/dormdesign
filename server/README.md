# DormDesign Server

DormDesign's backend is written in Typescript using Node.js and the Express web framework. For storing data, it uses Redis as an in-memory cache & MongoDB
as a persistent database. In a production environment the server is configured to use a MongoDB Atlas instance, however during development we use a locally 
hosted MongoDB instance.

## Setup

The server should be run using the Docker Compose configuration located in the root of the repository. This ensures that the server's dependencies 
(database & cache) are also running.

## Architecture

The architecture of DormDesign is relatively straightforward, however more complicated than a standard REST API. This document will attempt to give a brief overview as to how the application is structured and how each component works. At a high level there are four major components: the client, server, cache, and database. The overall architecture of these components is as follows:

```
client <--> server <--> cache <--> database
```
The client can send and receive data from the server, whether it be a room update, item update, or room deletion. The client will send these events to the
server (using WebSockets) which will then process them and determine what action to do next, if any. For instance, if a client moves an item, it will send a "move" event to the 
server. The server will then update the item in the cache and relay the changes to all other connected clients. This allows all other clients in your room 
to see the changes that you made.

The cache is a layer between the server and database that stores frequently modified data. What is the benefit of using this over a standard database like 
Postgres or MongoDB? The emphasis here is on *frequently modified*. While those databases *could* work, we want to spend as little time processing a 
request as possible. That means that once we receive a request, we don't want to spend precious milliseconds waiting for a room's data to be fetched from 
the database; we want the data as soon as possible, especially if we're making 100's of requests per second. The solution to this problem is an in-memory 
database. Since in-memory databases store data in RAM, we can read and write data without practically any latency. This makes it an ideal solution
for storing the data of each active room since while a room is active there will likely be hundreds or thousands of updates. Once this data is no longer needed (i.e. a room is no longer open), the data from the cache is *then* pushed to the persistent database for long-term storage.

**Note:** Originally, we stored information within the application as opposed to a dedicated cache. For most use cases this will work perfectly fine, however we transitioned to a Redis cache since it gave us ability to scale up if needed as well as some minor quality of life improvements.

The persistent database simply stores data until it is requested. When a user opens up a room, the server will check if the room exists within the cache. If so, then it will return the cached version. If not, then it will request it from the database. Once the data is loaded, it will be sent over to the 
cache. After the changes have been made to the room and it is no longer active, the data from the cache is removed and sent over to the database for persistent storage. The database itself never actually makes any 
modifications to the data, but instead just stores it until it is needed again. Unlike the cache, data in the database will persist even if the system is
restarted, turned off, or otherwise interrupted. 

## Access

The server is accessible at `localhost:5500/api`, or `localhost:5500/ws` for socket connections.
