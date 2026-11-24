const farmacia = db.getSiblingDB("farmacia");

const colecciones = [
    "medicamentos",
    "sedes",
    "inventario",
    "ventas",
    "eventos"
];

colecciones.forEach(function(nombre) {
    if (!farmacia.getCollectionNames().includes(nombre)) {
        farmacia.createCollection(nombre);
        print("Coleccion creada: " + nombre);
    } else {
        print("La coleccion ya existe: " + nombre);
    }
});

print("\n=== COLECCIONES DE LA BASE DE DATOS ===");
printjson(farmacia.getCollectionNames());
