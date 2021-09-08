export const assignFieldsIfNotNull = (obj : any, fields : { [fieldName: string] : any }) => {
  Object.keys(fields).forEach(k => {
    if(fields[k] != null)
      obj[k] = fields[k];
  })
};
