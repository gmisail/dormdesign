package models

type ListItem struct {
	Name string
	ClaimedBy string
	Quantity int
}

type List struct {
	Id string
	Name string
	Items []ListItem
}

func CreateList(id string, name string) *List {
	list := List{Id: id, Name: name, Items: []ListItem{} }
	return &list
}
