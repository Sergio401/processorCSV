export const convertToUpdatedObj = (obj) => {
  if (obj === null || typeof obj === 'undefined') {
    return null; // or undefined based on your requirement
  }

  if (typeof obj === 'string') {
    return { result: obj.toLowerCase() };
  }

  if (Array.isArray(obj)) {
    const logicOperator = obj[0].toLowerCase();
    const updatedData = obj
      .slice(1)
      .map(convertToUpdatedObj)
      .filter((e) => e !== null);
    if (!updatedData.length) {
      return null;
    }
    if (updatedData.length === 1) {
      return updatedData[0];
    }
    return { [logicOperator]: updatedData };
  }

  const result = {};
  const {
    name = '',
    operator = '',
    value = '',
    valueId = '',
    type = '',
    relatedManagedObjectId,
    selectedPropertyId = '',
    managedObject,
    selectedPropertyAliasId,
  } = obj;
  if (name !== '' || operator !== '' || value !== '' || valueId !== '') {
    switch (name) {
      case 'name':
        switch (operator) {
          case 'contains':
            result['nameContainsFold'] = value;
            break;
          case 'eq':
            result[valueId ? 'id' : 'name'] = Number(valueId) || value;
            break;
          case 'regexp':
            result['nameRegex'] = value;
            break;
          case 'notContains':
            result['not'] = {
              nameContains: value,
            };
            break;
        }
        break;
      case 'lifecycleStatus':
        switch (operator) {
          case 'contains':
            result['lifecyclestatus'] = value.toUpperCase();
            break;
          case 'eq':
            result['lifecyclestatus'] = value.toUpperCase();
            break;
          default:
            result['lifecyclestatusNotIn'] = [value.toUpperCase()];
            break;
        }
        break;
      case 'externalId':
        switch (operator) {
          case 'contains':
            result['externalIDContainsFold'] = value;
            break;
          case 'eq':
            result['externalID'] = value;
            break;
          case 'regexp':
            result['externalIDRegex'] = value;
            break;
          case 'notContains':
            result['not'] = {
              externalIDContains: value,
            };
            break;
          default:
            result['externalIDNotIn'] = [value];
            break;
        }
        break;
      case 'equipmentType':
        switch (operator) {
          case 'contains':
            result['hasTypeWith'] = [
              {
                nameContainsFold: value,
                hasManagedObjectWith: managedObject?.option?.key
                  ? [
                      {
                        id: Number(managedObject?.option?.key),
                      },
                    ]
                  : null,
              },
            ];
            break;
          case 'eq':
            result['hasTypeWith'] = [
              {
                [valueId ? 'id' : 'name']: Number(valueId) || value,
                ...(!valueId && managedObject?.option?.key
                  ? {
                      hasManagedObjectWith: [
                        {
                          id: Number(managedObject.option.key),
                        },
                      ],
                    }
                  : {}),
              },
            ];
            break;
          case 'regexp':
            result['hasTypeWith'] = [
              {
                nameRegex: value,
                hasManagedObjectWith: managedObject?.option?.key
                  ? [
                      {
                        id: Number(managedObject?.option?.key),
                      },
                    ]
                  : null,
              },
            ];
            break;
          case 'notContains':
            result['hasTypeWith'] = [
              {
                not: {
                  nameContainsFold: value,
                },
                hasManagedObjectWith: managedObject?.option?.key
                  ? [
                      {
                        id: Number(managedObject?.option?.key),
                      },
                    ]
                  : null,
              },
            ];
            break;
        }
        break;
      case 'managedObjects':
        switch (operator) {
          case 'eq':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  managedObject?.option?.key
                    ? {
                        id: Number(managedObject?.option?.key),
                      }
                    : {
                        name: managedObject?.option?.label,
                      },
                ],
              },
            ];
            break;
        }
        break;
      case 'equipmentProperty':
        switch (type) {
          case 'bool':
            result['and'] = [
              {
                hasPropertiesWith: [
                  {
                    boolVal: JSON.parse(value),
                    hasTypeWith: [
                      {
                        id: Number(selectedPropertyId),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'string':
            const selectedOperator =
              operator === 'eq'
                ? 'stringVal'
                : operator === 'regexp'
                ? 'stringValRegex'
                : 'stringValContainsFold';
            result['and'] = [
              {
                hasPropertiesWith: [
                  {
                    [selectedOperator]: value,
                    hasTypeWith: [
                      {
                        id: Number(selectedPropertyId),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'int':
            result['and'] = [
              {
                hasPropertiesWith: [
                  {
                    intVal: value && JSON.parse(value),
                    hasTypeWith: [
                      {
                        id: Number(selectedPropertyId),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'float':
            result['and'] = [
              {
                hasPropertiesWith: [
                  {
                    floatVal: value && JSON.parse(value),
                    hasTypeWith: [
                      {
                        id: Number(selectedPropertyId),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
        }
        break;
      case 'parentName':
        switch (operator) {
          case 'contains':
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  {
                    nameContainsFold: value,
                  },
                ],
              },
            ];
            break;
          case 'eq':
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  { [valueId ? 'id' : 'name']: Number(valueId) || value },
                ],
              },
            ];
            break;
          case 'regexp':
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [{ nameRegex: value }],
              },
            ];
            break;
        }
        break;
      case 'propertyAlias':
        switch (type) {
          case 'bool':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id:
                      obj?.name === 'propertyAlias'
                        ? Number(managedObject?.option?.key)
                        : Number(relatedManagedObjectId),
                    hasPropertyAliasWith: [
                      {
                        id: Number(selectedPropertyAliasId),
                      },
                    ],
                  },
                ],
              },
            ];
            result['hasPropertiesWith'] = [
              {
                boolVal: JSON.parse(value),
              },
            ];
            break;
          case 'string':
            const selectedOperator =
              operator === 'eq'
                ? 'stringVal'
                : operator === 'regexp'
                ? 'stringValRegex'
                : 'stringValContainsFold';
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id:
                      obj?.name === 'propertyAlias'
                        ? Number(managedObject?.option?.key)
                        : Number(relatedManagedObjectId),
                    hasPropertyAliasWith: [
                      {
                        id: Number(selectedPropertyAliasId),
                      },
                    ],
                  },
                ],
              },
            ];
            result['hasPropertiesWith'] = [
              {
                [selectedOperator]: value,
              },
            ];
            break;
          case 'int':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id:
                      obj?.name === 'propertyAlias'
                        ? Number(managedObject?.option?.key)
                        : Number(relatedManagedObjectId),
                    hasPropertyAliasWith: [
                      {
                        id: Number(selectedPropertyAliasId),
                      },
                    ],
                  },
                ],
              },
            ];
            result['hasPropertiesWith'] = [
              {
                intVal: value && JSON.parse(value),
              },
            ];
            break;
          case 'float':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id:
                      obj?.name === 'propertyAlias'
                        ? Number(managedObject?.option?.key)
                        : Number(relatedManagedObjectId),
                    hasPropertyAliasWith: [
                      {
                        id: Number(selectedPropertyAliasId),
                      },
                    ],
                  },
                ],
              },
            ];
            result['hasPropertiesWith'] = [
              {
                floatVal: value && JSON.parse(value),
              },
            ];
            break;
        }
        break;
      case 'relatedManagedObject':
        switch (type) {
          case 'bool':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id: Number(managedObject?.option?.key),
                  },
                ],
              },
            ];
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  {
                    hasTypeWith: [
                      {
                        hasManagedObjectWith: [
                          {
                            id: Number(relatedManagedObjectId),
                          },
                        ],
                      },
                    ],
                    hasPropertiesWith: [
                      {
                        hasTypeWith: [
                          {
                            hasPropertyTypeAliasWith: [
                              {
                                id: Number(selectedPropertyAliasId),
                              },
                            ],
                          },
                        ],
                      },
                      {
                        boolVal: JSON.parse(value),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'string':
            const selectedOperator =
              operator === 'eq'
                ? 'stringVal'
                : operator === 'regexp'
                ? 'stringValRegex'
                : 'stringValContainsFold';
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id: Number(managedObject?.option?.key),
                  },
                ],
              },
            ];
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  {
                    hasTypeWith: [
                      {
                        hasManagedObjectWith: [
                          {
                            id: Number(relatedManagedObjectId),
                          },
                        ],
                      },
                    ],
                    hasPropertiesWith: [
                      {
                        hasTypeWith: [
                          {
                            hasPropertyTypeAliasWith: [
                              {
                                id: Number(selectedPropertyAliasId),
                              },
                            ],
                          },
                        ],
                      },
                      {
                        [selectedOperator]: value,
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'int':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id: Number(managedObject?.option?.key),
                  },
                ],
              },
            ];
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  {
                    hasTypeWith: [
                      {
                        hasManagedObjectWith: [
                          {
                            id: Number(relatedManagedObjectId),
                          },
                        ],
                      },
                    ],
                    hasPropertiesWith: [
                      {
                        hasTypeWith: [
                          {
                            hasPropertyTypeAliasWith: [
                              {
                                id: Number(selectedPropertyAliasId),
                              },
                            ],
                          },
                        ],
                      },
                      {
                        intVal: value && JSON.parse(value),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
          case 'float':
            result['hasTypeWith'] = [
              {
                hasManagedObjectWith: [
                  {
                    id: Number(managedObject?.option?.key),
                  },
                ],
              },
            ];
            result['hasParentPositionWith'] = [
              {
                hasParentWith: [
                  {
                    hasTypeWith: [
                      {
                        hasManagedObjectWith: [
                          {
                            id: Number(relatedManagedObjectId),
                          },
                        ],
                      },
                    ],
                    hasPropertiesWith: [
                      {
                        hasTypeWith: [
                          {
                            hasPropertyTypeAliasWith: [
                              {
                                id: Number(selectedPropertyAliasId),
                              },
                            ],
                          },
                        ],
                      },
                      {
                        floatVal: value && JSON.parse(value),
                      },
                    ],
                  },
                ],
              },
            ];
            break;
        }
        break;
    }
    return result;
  }
  return null;
};

export const convertToSql = (id, equipmentFilter) => {
    const sqlSentence = `UPDATE tenant_symphony.network_groups SET equipment_filter = '${JSON.stringify(equipmentFilter)}', progress = 'PENDING', status = 1 WHERE id = ${id || 'XXXX'}`;
    return sqlSentence
}

export const findNameRegex = (obj) => {
  for (let key in obj) {
    if (key === 'nameRegex') {
      return obj[key];
    } else if (typeof obj[key] === 'object') {
      const result = findNameRegex(obj[key]);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export const updateRawFilter = (row) => {
  try {
    const nameRegex = row['NameRegex'];
    const rawFilter = JSON.parse(row['Raw_Filter']);

    // Asumimos que el primer elemento del array siempre es "and"
    if (Array.isArray(rawFilter) && rawFilter.length > 1 && typeof rawFilter[1] === 'object') {
      rawFilter[1].value = nameRegex;
    }

    return JSON.stringify(rawFilter);
  } catch (error) {
    console.error(`Error updating Raw_Filter for row: ${row['ID']}`, error);
    return row['Raw_Filter']; // Devolver el valor original en caso de error
  }
};

export const convertFromUpdatedObj = (result) => {
  if (result === null || typeof result === 'undefined') {
    return null;
  }

  if (typeof result === 'object' && 'result' in result) {
    return result.result.toUpperCase();
  }

  if (Array.isArray(result)) {
    const logicOperator = Object.keys(result[0])[0];
    return [
      logicOperator.toUpperCase(),
      ...result[0][logicOperator].map(convertFromUpdatedObj).filter(Boolean)
    ];
  }

  const obj = {};

  if ('nameContainsFold' in result) {
    obj.name = 'name';
    obj.operator = 'contains';
    obj.value = result.nameContainsFold;
  } else if ('id' in result) {
    obj.name = 'name';
    obj.operator = 'eq';
    obj.valueId = result.id.toString();
  } else if ('name' in result) {
    obj.name = 'name';
    obj.operator = 'eq';
    obj.value = result.name;
  } else if ('nameRegex' in result) {
    obj.name = 'name';
    obj.operator = 'regexp';
    obj.value = result.nameRegex;
  } else if ('not' in result && 'nameContains' in result.not) {
    obj.name = 'name';
    obj.operator = 'notContains';
    obj.value = result.not.nameContains;
  } else if ('lifecyclestatus' in result) {
    obj.name = 'lifecycleStatus';
    obj.operator = result.lifecyclestatusNotIn ? 'ne' : 'eq';
    obj.value = result.lifecyclestatus || result.lifecyclestatusNotIn[0];
  } else if ('externalIDContainsFold' in result) {
    obj.name = 'externalId';
    obj.operator = 'contains';
    obj.value = result.externalIDContainsFold;
  } else if ('externalID' in result) {
    obj.name = 'externalId';
    obj.operator = 'eq';
    obj.value = result.externalID;
  } else if ('externalIDRegex' in result) {
    obj.name = 'externalId';
    obj.operator = 'regexp';
    obj.value = result.externalIDRegex;
  } else if ('not' in result && 'externalIDContains' in result.not) {
    obj.name = 'externalId';
    obj.operator = 'notContains';
    obj.value = result.not.externalIDContains;
  } else if ('hasTypeWith' in result) {
    const typeWith = result.hasTypeWith[0];
    if ('nameContainsFold' in typeWith) {
      obj.name = 'equipmentType';
      obj.operator = 'contains';
      obj.value = typeWith.nameContainsFold;
    } else if ('id' in typeWith) {
      obj.name = 'equipmentType';
      obj.operator = 'eq';
      obj.valueId = typeWith.id.toString();
    } else if ('name' in typeWith) {
      obj.name = 'equipmentType';
      obj.operator = 'eq';
      obj.value = typeWith.name;
    } else if ('nameRegex' in typeWith) {
      obj.name = 'equipmentType';
      obj.operator = 'regexp';
      obj.value = typeWith.nameRegex;
    } else if ('not' in typeWith) {
      obj.name = 'equipmentType';
      obj.operator = 'notContains';
      obj.value = typeWith.not.nameContainsFold;
    } else if ('hasManagedObjectWith' in typeWith) {
      obj.name = 'managedObjects';
      obj.operator = 'eq';
      const managedObject = typeWith.hasManagedObjectWith[0];
      obj.managedObject = {
        option: {
          key: managedObject.id ? managedObject.id.toString() : undefined,
          label: managedObject.name
        }
      };
    }
  } else if ('and' in result) {
    const andCondition = result.and[0];
    if ('hasPropertiesWith' in andCondition) {
      const propertyCondition = andCondition.hasPropertiesWith[0];
      obj.name = 'equipmentProperty';
      obj.selectedPropertyId = propertyCondition.hasTypeWith[0].id.toString();
      if ('boolVal' in propertyCondition) {
        obj.type = 'bool';
        obj.value = propertyCondition.boolVal.toString();
      } else if ('stringVal' in propertyCondition) {
        obj.type = 'string';
        obj.operator = 'eq';
        obj.value = propertyCondition.stringVal;
      } else if ('stringValRegex' in propertyCondition) {
        obj.type = 'string';
        obj.operator = 'regexp';
        obj.value = propertyCondition.stringValRegex;
      } else if ('stringValContainsFold' in propertyCondition) {
        obj.type = 'string';
        obj.operator = 'contains';
        obj.value = propertyCondition.stringValContainsFold;
      } else if ('intVal' in propertyCondition) {
        obj.type = 'int';
        obj.value = propertyCondition.intVal.toString();
      } else if ('floatVal' in propertyCondition) {
        obj.type = 'float';
        obj.value = propertyCondition.floatVal.toString();
      }
    }
  } else if ('hasParentPositionWith' in result) {
    const parentCondition = result.hasParentPositionWith[0].hasParentWith[0];
    obj.name = 'parentName';
    if ('nameContainsFold' in parentCondition) {
      obj.operator = 'contains';
      obj.value = parentCondition.nameContainsFold;
    } else if ('id' in parentCondition) {
      obj.operator = 'eq';
      obj.valueId = parentCondition.id.toString();
    } else if ('name' in parentCondition) {
      obj.operator = 'eq';
      obj.value = parentCondition.name;
    } else if ('nameRegex' in parentCondition) {
      obj.operator = 'regexp';
      obj.value = parentCondition.nameRegex;
    }
  }

  // Note: The cases for 'propertyAlias' and 'relatedManagedObject' are more complex
  // and would require additional logic to fully reverse. This implementation
  // provides a basic structure that you can expand upon as needed.

  return obj;
};

export const deletePropertiesOption = (data) => {
  try {
    let parsedData = JSON.parse(JSON.stringify(data));

    // Función recursiva para procesar la estructura
    const processItem = (item) => {
      // Verificar si es un objeto
      if (typeof item === 'object' && !Array.isArray(item)) {
        // Borrar el arreglo "propertiesOption" si existe
        if (item.propertiesOption) {
          delete item.propertiesOption;
        }

        // Verificar si cumple la condición para ser reemplazado
        if (
          item.name === 'equipmentProperty' &&
          item.selectedProperty === 'DEVICENAME'
        ) {
          return {
            name: 'parentName',
            operator: item.operator, // Mantener el operador
            value: item.value, // Mantener el valor
            height: 39,
            tempValue: '',
            valueId: ''
          };
        }
        
        // Procesar los valores del objeto
        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            item[key] = processItem(item[key]);
          }
        }
      }

      // Verificar si es un arreglo
      if (Array.isArray(item)) {
        return item.map(processItem);
      }

      return item;
    };

    // Procesar los datos
    return processItem(parsedData);

  } catch (error) {
    // Ignorar si no se puede parsear el JSON
    console.error("Error al parsear los datos:", error);
    return null;
  }
}





