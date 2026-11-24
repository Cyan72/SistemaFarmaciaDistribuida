const farmacia = db.getSiblingDB("farmacia");

// Indices de medicamentos
farmacia.medicamentos.createIndex(
    { codigo: 1 },
    { unique: true, name: "idx_medicamento_codigo" }
);

farmacia.medicamentos.createIndex(
    { nombre: 1 },
    { name: "idx_medicamento_nombre" }
);

farmacia.medicamentos.createIndex(
    { categoria: 1 },
    { name: "idx_medicamento_categoria" }
);

// Indices de sedes
farmacia.sedes.createIndex(
    { codigo: 1 },
    { unique: true, name: "idx_sede_codigo" }
);

// Indices de inventario
farmacia.inventario.createIndex(
    { medicamento_id: 1, sede_id: 1 },
    { unique: true, name: "idx_medicamento_sede" }
);

farmacia.inventario.createIndex(
    { sede_id: 1 },
    { name: "idx_inventario_sede" }
);

// Indices de ventas
farmacia.ventas.createIndex(
    { sede_id: 1, fecha: -1 },
    { name: "idx_venta_sede_fecha" }
);

// Indices de eventos
farmacia.eventos.createIndex(
    { fecha: -1 },
    { name: "idx_evento_fecha" }
);

farmacia.eventos.createIndex(
    { tipo: 1 },
    { name: "idx_evento_tipo" }
);

print("Indices creados correctamente.");

print("\n=== INDICES REGISTRADOS ===");

farmacia.getCollectionNames().forEach(function(nombre) {
    print("\nColeccion: " + nombre);
    printjson(farmacia.getCollection(nombre).getIndexes());
});
