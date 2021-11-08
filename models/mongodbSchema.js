{
   $jsonSchema: {
     bsonType: 'object',
     required: [
       'user'
     ],
     additionalProperties: false,
     properties: {
       _id: {},
       user: {
         bsonType: 'object',
         required: [
           'username',
           'email',
           'password'
         ],
         additionalProperties: false,
         properties: {
           username: {
             bsonType: 'string'
           },
           email: {
             bsonType: 'string'
           },
           password: {
             bsonType: 'string'
           }
         }
       },
       docs: {
         bsonType: 'array',
         uniqueItems: true,
         items: {
           bsonType: [
             'object'
           ],
           required: [
             'docname'
           ],
           additionalProperties: false,
           description: '\'items\' must contain the stated fields.',
           properties: {
             docname: {
               bsonType: 'string',
               description: '\'docname\' must be unique.'
             },
             docdata: {
               bsonType: 'string'
             }
           }
         }
       }
     }
   }
 }