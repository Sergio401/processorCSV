const deletePropertiesOption = (item) => {
    if (item.propertiesOption) {
        delete item.propertiesOption;
    }
    return item
}

const changePropertiesDeviceNameToParentName = (item) => {
    if (item.selectedProperty === 'DEVICENAME') {
        return {
            name: 'parentName',
            operator: item.operator,
            value: item.value,
            
        }
    } else {
        return item;
    }
}

const addNewFields = (item) => {
    if (!item.hasOwnProperty('height')) {
        item.height = 15; // Valor por defecto
      }
 
      if (!item.hasOwnProperty('selectedPropertyId')) {
        item.selectedPropertyId = ""; // Valor por defecto
      }
 
      if (!item.hasOwnProperty('InputForEquipmentId')) {
        item.InputForEquipmentId = ""; // Valor por defecto
      }
      return item;
}


export const processMigration = (data) => {
    try {
        let stringifiedData = JSON.stringify(data);

        console.log(stringifiedData.charAt(stringifiedData.length - 1));
        if (stringifiedData.charAt(stringifiedData.length - 1) !== ']') {
            console.log('ERROR');
            
            return ["ERROR"]
        }

        let parsedData = JSON.parse(stringifiedData);
        const processItem = (item) => {
            if (typeof item === 'object') {
                const rawFilterWithOutPropertiesOption = deletePropertiesOption(item);                
                if(item.name === 'equipmentProperty') {
                    const rawFilterWithParentRule = changePropertiesDeviceNameToParentName(rawFilterWithOutPropertiesOption);
                    return addNewFields(rawFilterWithParentRule);
                }
                for (let key in item) {
                    if (item.hasOwnProperty(key)) {
                        item[key] = processItem(item[key]);
                    }
                  }
                  return item
                
                
            } else {
                return item
            }
           
        }
        
        return processItem(parsedData);

    } catch (error) {
        console.error("Error al parsear los datos:", error);
        return null;
    }

}

