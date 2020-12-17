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

## Development

1. Install docker and docker-compose
2. Navigate to the root of the project and run docker-compose -f docker-compose.dev.yml up --build
3. Site can be viewed at localhost:3000

## Deployment

1. Install docker and docker-compose
2. Navigate to the root of the project and run docker-compose up --build -d
3. Site is served on port 5500

