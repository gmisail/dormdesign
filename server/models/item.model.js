let Item = {};

/**vtype RoomItem struct {
	ID string `json:"id" rethinkdb:"id"`
	Name string `json:"name" rethinkdb:"name"`
	Quantity int `json:"quantity" rethinkdb:"quantity"`
	ClaimedBy string `json:"claimedBy" rethinkdb:"claimedBy"`
	VisibleInEditor bool `json:"visibleInEditor" rethinkdb:"visibleInEditor"`
	Dimensions ItemDimensions `json:"dimensions" rethinkdb:"dimensions"`
	EditorPosition EditorPoint `json:"editorPosition" rethinkdb:"editorPosition"`
	EditorRotation float64 `json:"editorRotation" rethinkdb:"editorRotation"`
	EditorLocked bool `json:"editorLocked" rethinkdb:"editorLocked"`
	EditorZIndex float64 `json:"editorZIndex" rethinkdb:"editorZIndex"`
}

type ItemDimensions struct {
	Width float64 `json:"width" rethinkdb:"width"`
	Length float64 `json:"length" rethinkdb:"length"`
	Height float64 `json:"height" rethinkdb:"height"`
} */

Item.create = function(name, quantity) 
{
    return {
        "name": name,
        "quantity": quantity,
        visibleInEditor: false,
        dimensions: {
            width: 1,
            height: 1,
            length: 1
        },
        editorPosition: {
            x: 0,
            y: 0
        }
    };
}

module.exports = Item;