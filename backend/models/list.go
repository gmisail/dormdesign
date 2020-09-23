package models

type ListItem struct {
	Name string
	ClaimedBy string
	Quantity int
}

type List struct {
	id string
	name string
	items []ListItem
}

func CreateList(id string, name string) *List {
	list := List{Id: id, Name: name, Items: []ListItem{} }
	return &list
}
