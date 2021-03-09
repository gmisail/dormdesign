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

## Development Environment
1. Install `docker` and `docker-compose`
2. Navigate to the `/frontend` folder and run `npm install`
3. Then from the root of the project directory run `docker-compose -f docker-compose.dev.yml up --build` to start the server. Depending on your permissions, you may need to run this command using `sudo`. The site can then be accessed at `localhost:5500`

## Deployment
Same as development, but instead start the production environment with the command `docker-compose up --build -d`. Similar to the development environment, it may be necessary to run this command using `sudo`.

