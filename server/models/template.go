package models

import (
	"errors"

	"github.com/google/uuid"
	rdb "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

type Template struct {
	ID string `json:"id" rethinkdb:"id"`
	TargetID string `json:"targetId" rethinkdb:"targetId"`	
}

/*
	Create a template ID for a given room
*/
func CreateTemplate(database *rdb.Session, id string) (Template, error) {
	templateID := uuid.New().String()

	/*
		Templates act as a fast lookup table for other rooms. Thus, the new ID
		points to the old id (or rather the one that we are binding the new
		ID to)
	*/
	template := Template{ 
		ID: templateID,
		TargetID: id,
	}
	
	err := rdb.DB("dd_data").Table("templates").Insert(template).Exec(database)

	if err != nil {
		return Template{}, err
	}
	
	return template, nil
}

/*
	Returns a specific room
*/
func GetTemplate(database *rdb.Session, id string) (Template, error) {
	res, err := rdb.DB("dd_data").Table("templates").Get(id).Run(database)

	if err != nil {
		return Template{}, err
	}

	var data Template
	err = res.One(&data)

	if err == rdb.ErrEmptyResult {
		err = errors.New("Template not found")
	}

	if err != nil {
		return Template{}, err
	}

	defer res.Close()

	return data, nil
}
