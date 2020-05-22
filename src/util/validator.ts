/**
 * 
 * @param id 
 */
export const isValidId = (id: number): boolean => {
    return !!(id && typeof id === 'number' && Number.isInteger(id) && id > 0);
};

/**
 * 
 * @param strs 
 */
export const isValidStrings = (...strs: string[]): boolean => {
    return (strs.filter(str => !str || typeof str !== 'string').length == 0);
};

/**
 * 
 * @param obj 
 * @param nullableProps 
 */
export const isValidObject = (obj: Object, ...nullableProps: string[]) => {
    return obj && Object.keys(obj).every(key => {
        if (nullableProps.includes(key)) return true;
        return obj[key];
    });
};

/**
 * 
 * @param prop 
 * @param type 
 */
export const isPropertyOf = (prop: string, type: any) => {

    if (!prop || !type) {
        return false;
    }

    let typeCreator = <T>(Type: (new () => T)): T => {
        return new Type();
    } 

    let tempInstance;
    try {
        tempInstance = typeCreator(type);
    } catch {
        return false;
    }
    
    return Object.keys(tempInstance).includes(prop);

}

/**
 * 
 * @param obj 
 */
export function isEmptyObject<T>(obj: T) {
    return obj && Object.keys(obj).length === 0;
}

/**
 * 
 */
export default {
    isValidId,
    isValidStrings,
    isValidObject,
    isPropertyOf,
    isEmptyObject
}
