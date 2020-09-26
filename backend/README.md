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
DATABASE_ADDRESS=<redis's ip address>
```
