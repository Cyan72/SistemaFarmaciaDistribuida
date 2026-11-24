const farmacia = db.getSiblingDB("farmacia");

farmacia.runCommand({
    collMod: "medicamentos",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "codigo",
                "nombre",
                "categoria",
                "precio",
                "activo"
            ],
            properties: {
                codigo: {
                    bsonType: "string",
                    minLength: 1
                },
                nombre: {
                    bsonType: "string",
                    minLength: 1
                },
                categoria: {
                    bsonType: "string",
                    minLength: 1
                },
                precio: {
                    bsonType: "decimal",
                    minimum: 0
                },
                activo: {
                    bsonType: "bool"
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

print("Validacion de medicamentos configurada.");

farmacia.runCommand({
    collMod: "sedes",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "codigo",
                "nombre",
                "ciudad",
                "direccion",
                "activo"
            ],
            properties: {
                codigo: {
                    bsonType: "string",
                    minLength: 1
                },
                nombre: {
                    bsonType: "string",
                    minLength: 1
                },
                ciudad: {
                    bsonType: "string"
                },
                direccion: {
                    bsonType: "string"
                },
                activo: {
                    bsonType: "bool"
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

print("Validacion de sedes configurada.");

farmacia.runCommand({
    collMod: "inventario",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "medicamento_id",
                "sede_id",
                "stock",
                "stock_minimo",
                "fecha_actualizacion"
            ],
            properties: {
                medicamento_id: {
                    bsonType: "objectId"
                },
                sede_id: {
                    bsonType: "objectId"
                },
                stock: {
                    bsonType: "int",
                    minimum: 0
                },
                stock_minimo: {
                    bsonType: "int",
                    minimum: 0
                },
                fecha_actualizacion: {
                    bsonType: "date"
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

print("Validacion de inventario configurada.");

print("\n=== VALIDACIONES CONFIGURADAS ===");
