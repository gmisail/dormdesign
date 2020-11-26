package utils

import (
	"fmt"
	"reflect"
)

// UpdateStructJSONFields takes an object and a map of format jsonFieldToUpdate : newValue.
// tryConvertTypes param specifies whether to try and convert updated numerical value to numerical 
// value of struct field when their types don't match (e.g. when field has type int and updated has 
// type float64)
func UpdateStructJSONFields(obj interface{}, updates *map[string]interface{}, tryConvertTypes bool) error {
	return updateStructFieldsDeep(reflect.ValueOf(obj).Elem(), updates, tryConvertTypes)
}

// Recursive helper function
func updateStructFieldsDeep(structValue reflect.Value, updates *map[string]interface{}, tryConvertTypes bool) error {
	/*
		Map containing item field names mapped by their corresponding json tags.
		E.g. name -> Name, quantity -> Quantity
	*/
	jsonTagMap := make(map[string]string)
	for i := 0; i < structValue.NumField(); i++ {
		field := structValue.Type().Field(i)
		jsonTagMap[field.Tag.Get("json")] = field.Name
	}

	for key, value := range *updates {
		fieldName, ok := jsonTagMap[key]
		if !ok  {
			return fmt.Errorf("Invalid property '%s'", key)
		}

		structField := structValue.FieldByName(fieldName)
		structFieldType := structField.Type()

		var val reflect.Value;
		// If value is nil, set to zero value of struct field
		if value == nil {
			val = reflect.Zero(structFieldType)
		} else {
			val = reflect.ValueOf(value)
		}
		valType := val.Type()
		
		canSet := true
		if structFieldType != valType {
			if nestedValue, ok := value.(map[string]interface{}); ok && structField.Kind() == reflect.Struct {
				canSet = false
				// Field is a nested struct, recurse on nested field
				if err := updateStructFieldsDeep(reflect.Indirect(structField), &nestedValue, tryConvertTypes); err != nil {
					return err;
				}
			} else {
				if tryConvertTypes {
					if (valType.ConvertibleTo(structFieldType)) {
						val = val.Convert(structFieldType)
					} else {
						return fmt.Errorf("Unable to convert %s to %s for field '%s'", valType, structFieldType, key)
					}
				} else {
					// Not a nested field, so values should match
					return fmt.Errorf("Incorrect value type for property '%s'", key)
				}
				
			}
		}
		if (canSet) {
			structField.Set(val)
		}
	}

	return nil
}