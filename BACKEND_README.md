# DormDesign Server

To run DormDesign for the first time, run the following commands.
```
go install
go build .
./dormdesign
```

This will install all necessary packages, build the source code, and then execute it. 

## Database

DormDesign uses a `.env` file to manage database configurations. In the root directory (or wherever the DormDesign executable is) create a `.env` file. In this file, add the following variable:

```
DATABASE_ADDRESS=<rethink's ip address>
```

To setup the database structure, go to the Administrative Panel (`localhost:8080`) and go to the Tables tab. Create a new table named `dd_data`. Now, create a new table within `dd_data` called `rooms`. This is where the room data will be located. 
