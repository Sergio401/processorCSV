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

const addNewFields = (item,finalProperties) => {
    if (!item.hasOwnProperty('height')) {
        item.height = 15; // Valor por defecto
      }
 
      if (!item.hasOwnProperty('selectedPropertyId')) {
        const value = finalProperties.find(fp => fp.name === item.selectedProperty)?.id
        
        item.selectedPropertyId = value || ""; // Valor por defecto
      }
 
      if (!item.hasOwnProperty('InputForEquipmentId')) {
        item.InputForEquipmentId = "124554051600"; // Valor por defecto
      }
      return item;
}


export const processMigration = (data, finalProperties) => {
    try {
        let stringifiedData = JSON.stringify(data);
        let equipmentTypes = {}

        let parsedData = JSON.parse(stringifiedData);
        const processItem = (item) => {
            if (typeof item === 'object') {
                const rawFilterWithOutPropertiesOption = deletePropertiesOption(item);                
                if(item.name === 'equipmentProperty') {
                    const rawFilterWithParentRule = changePropertiesDeviceNameToParentName(rawFilterWithOutPropertiesOption);
                    return addNewFields(rawFilterWithParentRule, finalProperties);
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



const validationSNMP = (item) => {
    if (!item.inputForEquipment || item.inputForEquipment === 'SNMP-Interface') {
         item = ['IS_SNMP']
    } else {
        item = ['is_not_snmp']
    }
    return item
}

export const processValidationSNMP = (data) => {
    try {
        let stringifiedData = JSON.stringify(data);
        if (stringifiedData.charAt(stringifiedData.length - 1) !== ']') {
            return ["ERROR"]
        }
        let parsedData = JSON.parse(stringifiedData);
        let counterSnmp = 0;
        const processItem = (item) => {
            if (typeof item === 'object') {
                const arrayValidationSNMP = validationSNMP(item);
                if(arrayValidationSNMP[0] ==='is_not_snmp') counterSnmp++;
                for (let key in item) {
                    if ( item[key].hasOwnProperty('inputForEquipment') && item.hasOwnProperty(key)) {
                        item[key] = processItem(item[key]);
                    }
                  }
                  return counterSnmp < 1?[ 'IS_SNMP' ] : [ 'is_not_snmp' ];
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



export const extractEquipmentTypes = (data) => {
    
    try {
        let stringifiedData = JSON.stringify(data);
        let equipmentTypes = {}
        let parsedData = JSON.parse(stringifiedData);
        
        const processItem = (item) => {
            if (typeof item === 'object') { 
                if(item?.name === 'equipmentProperty') {
                    const rawFilterWithOutPropertiesOption = deletePropertiesOption(item);  
                    equipmentTypes[item.inputForEquipment] = item.inputForEquipment
                    console.log('rawFilterWithParentRule', item.inputForEquipment);
                    
                    return rawFilterWithOutPropertiesOption
                }
                for (let key in item) {
                    if (item.hasOwnProperty(key)) {
                        item[key] = processItem(item[key]);
                    }
                  }
                  return Object.keys(equipmentTypes)
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

