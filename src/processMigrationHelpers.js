const deletePropertiesOption = (item) => {
    if (item.propertiesOption) {
        delete item.propertiesOption;
    }
}

const changePropertiesDeviceNameToParentName = (item) => {
    if (item.selectedProperty === 'DEVICENAME') {
        return {
            name: 'parentName',
            operator: item.operator,
            value: item.value,
            
        }
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
}


export const processMigration = (data) => {
    try {
        let stringifiedData = JSON.stringify(data);

        console.log(stringifiedData.charAt(stringifiedData.length - 1));

        let parsedData = JSON.parse(stringifiedData);
        let rawFilter
        const processItem = (item) => {
            if (typeof item === 'object' && !Array.isArray(item)) {
                const rawFilterWithOutPropertiesOption = deletePropertiesOption(item);
                if(item.name === 'equipmentProperty') {
                    const rawFilterWithParentRule = changePropertiesDeviceNameToParentName(rawFilterWithOutPropertiesOption);
                    rawFilter = addNewFields(rawFilterWithParentRule);
                }
            }
            for (let key in rawFilter) {
                if (rawFilter.hasOwnProperty(key)) {
                  rawFilter[key] = processItem(rawFilter[key]);
                }
              }
              
        }

        return processItem(parsedData);

    } catch (error) {
        console.error("Error al parsear los datos:", error);
        return null;
    }

}

