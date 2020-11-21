package utils

import (
	"fmt"
	"reflect"
)

// UpdateStructJSONFields takes an object and a map of format jsonFieldToUpdate : newValue.
func UpdateStructJSONFields(obj interface{}, updates map[string]interface{}) error {
	return updateStructFieldsDeep(reflect.ValueOf(obj).Elem(), updates)
}

// Recursive helper function
func updateStructFieldsDeep(structValue reflect.Value, updates map[string]interface{}) error {
	
	/*
		Map containing item field names mapped by their corresponding json tags.
		E.g. name -> Name, quantity -> Quantity
	*/
	jsonTagMap := make(map[string]string)
	for i := 0; i < structValue.NumField(); i++ {
		field := structValue.Type().Field(i)
		jsonTagMap[field.Tag.Get("json")] = field.Name
	}

	for key, value := range updates {
		fieldName, ok := jsonTagMap[key]
		if !ok  {
			return fmt.Errorf("Invalid property '%s'", key)
		}

		structField := structValue.FieldByName(fieldName)
		val := reflect.ValueOf(value)
		
		if structField.Type() != val.Type() {
			if nestedValue, ok := value.(map[string]interface{}); ok && structField.Kind() == reflect.Struct {
				// Field is a nested struct, recurse on nested field
				if err := updateStructFieldsDeep(reflect.Indirect(structField), nestedValue); err != nil {
					return err;
				}
			} else {
				// Not a nested field, so values should match
				return fmt.Errorf("Incorrect value type for property '%s'", key)
			}
		} else {
			structField.Set(val)
		}
	}

	return nil
}