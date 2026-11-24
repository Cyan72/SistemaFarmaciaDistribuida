const farmacia = db.getSiblingDB("farmacia");

let aprobadas = 0;
let fallidas = 0;

function verificar(nombre, condicion) {
    if (condicion) {
        print("[OK] " + nombre);
        aprobadas++;
    } else {
        print("[ERROR] " + nombre);
        fallidas++;
    }
}

print("\n=== PRUEBA 1: COLECCIONES ===");

const colecciones = [
    "medicamentos",
    "sedes",
    "inventario",
    "ventas",
    "eventos"
];

colecciones.forEach(function(nombre) {
    verificar(
        "Existe la coleccion " + nombre,
        farmacia.getCollectionNames().includes(nombre)
    );
});

print("\n=== PRUEBA 2: DATOS INICIALES ===");

verificar(
    "Existen 10 medicamentos",
    farmacia.medicamentos.countDocuments({}) === 10
);

verificar(
    "Existen 3 sedes",
    farmacia.sedes.countDocuments({}) === 3
);

verificar(
    "Existen 30 registros de inventario",
    farmacia.inventario.countDocuments({}) === 30
);

print("\n=== PRUEBA 3: INDICE UNICO ===");

try {
    const resultado = farmacia.medicamentos.insertOne({
        codigo: "MED001",
        nombre: "Medicamento duplicado",
        categoria: "Pruebas",
        precio: NumberDecimal("1.00"),
        activo: true
    });

    verificar("Rechazar medicamento duplicado", false);

    farmacia.medicamentos.deleteOne({
        _id: resultado.insertedId
    });

} catch (error) {
    verificar(
        "Rechazar medicamento duplicado",
        error.code === 11000
    );

    print("Codigo del error: " + error.code);
}

print("\n=== PRUEBA 4: INDICE COMPUESTO ===");

const medicamento = farmacia.medicamentos.findOne({
    codigo: "MED001"
});

const sede = farmacia.sedes.findOne({
    codigo: "SED001"
});

if (!medicamento || !sede) {
    throw new Error("Faltan datos iniciales.");
}

const filtro = {
    medicamento_id: medicamento._id,
    sede_id: sede._id
};

try {
    const resultado = farmacia.inventario.insertOne({
        medicamento_id: medicamento._id,
        sede_id: sede._id,
        stock: NumberInt(50),
        stock_minimo: NumberInt(10),
        fecha_actualizacion: new Date()
    });

    verificar("Rechazar inventario duplicado", false);

    farmacia.inventario.deleteOne({
        _id: resultado.insertedId
    });

} catch (error) {
    verificar(
        "Rechazar inventario duplicado",
        error.code === 11000
    );

    print("Codigo del error: " + error.code);
}

print("\n=== PRUEBA 5: STOCK ACTUALIZADO ===");

const inventario = farmacia.inventario.findOne(filtro);

verificar(
    "El stock actualizado es 120",
    inventario !== null &&
    inventario.stock === 120
);

print("\n=== PRUEBA 6: ELIMINACION ===");

verificar(
    "MED011 fue eliminado",
    farmacia.medicamentos.findOne({
        codigo: "MED011"
    }) === null
);

print("\n=== PRUEBA 7: INTEGRIDAD DE DATOS ===");

let referenciasCorrectas = true;

farmacia.inventario.find().forEach(function(item) {

    const medicamentoExiste =
        farmacia.medicamentos.findOne({
            _id: item.medicamento_id
        });

    const sedeExiste =
        farmacia.sedes.findOne({
            _id: item.sede_id
        });

    if (!medicamentoExiste || !sedeExiste) {
        referenciasCorrectas = false;
    }
});

verificar(
    "Referencias del inventario correctas",
    referenciasCorrectas
);

print("\n=== RESULTADOS FINALES ===");

print("Pruebas aprobadas: " + aprobadas);
print("Pruebas fallidas: " + fallidas);
print("Total de pruebas: " + (aprobadas + fallidas));

if (fallidas === 0) {
    print("TODAS LAS PRUEBAS FUERON EXITOSAS.");
} else {
    throw new Error("Existen pruebas fallidas.");
}
