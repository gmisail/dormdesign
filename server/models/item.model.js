let Item = {};

/**
 * Create an item based off of the given parameters & initialize each of the other parameters to their default values
 * @param { object } item 
 */
Item.create = function(item) 
{
    return {
        "name": item.name,
        "quantity": item.quantity || 1,
        visibleInEditor: item.visibleInEditor || false,
        dimensions: {
            width: (item.dimensions !== undefined && item.dimensions.width !== undefined) ? item.dimensions.width : 1,
            height: (item.dimensions !== undefined && item.dimensions.height !== undefined) ? item.dimensions.height : 1,
            length: (item.dimensions !== undefined && item.dimensions.length !== undefined) ? item.dimensions.length : 1
        },
        editorPosition: {
            x: (item.editorPosition !== undefined && item.editorPosition.x !== undefined) ? item.editorPosition.x : 0,
            y: (item.editorPosition !== undefined && item.editorPosition.y !== undefined) ? item.editorPosition.y : 0
        }
    };
}

module.exports = Item;