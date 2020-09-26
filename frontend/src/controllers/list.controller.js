let TEST_ID_COUNTER = 0;
var TEST_ITEMS = [
    {
        id: TEST_ID_COUNTER++,
        name: "Fridge",
        quantity: 4,
        claimedBy: undefined,
    },
    {
        id: TEST_ID_COUNTER++,
        name: "Soundbar",
        quantity: 1,
        claimedBy: "John Smith",
    },
    {
        id: TEST_ID_COUNTER++,
        name: "Microwave",
        quantity: 10,
        claimedBy: undefined,
    },
]

class ListController {

    static getList(done) {

        // as of now, just pass the static data to the callback.
        done(TEST_ITEMS);
    }

    static addListItem(item, done) {
        item.id = TEST_ID_COUNTER++;
        if (item.name.length === 0) {
            item.name = "New Item";
        }
         
        TEST_ITEMS.push(item);
        
        done(TEST_ITEMS);
    }

    static editListItem() {

    }

    static removeListItem() {

    }

}

export default ListController;