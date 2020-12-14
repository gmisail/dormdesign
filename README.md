<img src="/frontend/src/assets/logo.svg" alt="DormDesign" width="400"/>
 
#### A web application that aims to streamline the dorm packing and planning process. 

DormDesign allows roommates to collaboratively design and plan our their dorm room. Users can keep track of different items and position them in the room using the editor. All actions are updated and displayed to all users viewing the room in realtime.

## Key Features
- Claim and keep track of items
- Position items inside of a to-scale floor plan of the room
- Create rooms from pre-defined templates
- Changes are synced in realtime

## Screenshots

<img src="/screenshots/room-route.png" alt="room editor screenshot" width="800" />

## Deployment

DormDesign requires that Go, Echo, and React be installed in order to build and deploy. To build the backend, please refer to the `BACKEND_README` document. As for the frontend, all of its dependencies can be installed by navigating to the `frontend` directory and running `npm install`. Once this is complete, the production frontend must be built so that the server can host it. To do this, run `npm run build`. The respective files will be output to the `frontend/build` directory.

Once everything is built, deployment is as easy as launching the database and server:
```
rethinkdb
./dormdesign
```
You can then navigate to the service by going to the IP address that Echo specifies, or by navigating to wherever you're hosting it from.
